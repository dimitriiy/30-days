package main

import (
	"archive/zip"
	"bytes"
	"encoding/csv"
	"encoding/json"
	"encoding/xml"
	"errors"
	"io"
	"sort"
	"strconv"
	"strings"
	"syscall/js"
	"unicode/utf8"
)

type sharedString struct {
	Text string `xml:"t"`
	Runs []struct {
		Text string `xml:"t"`
	} `xml:"r"`
}

type stringTable struct {
	Items []sharedString `xml:"si"`
}
type worksheet struct {
	Rows []struct {
		Cells []struct {
			Ref    string `xml:"r,attr"`
			Type   string `xml:"t,attr"`
			Value  string `xml:"v"`
			Inline struct {
				Text string `xml:"t"`
			} `xml:"is"`
		} `xml:"c"`
	} `xml:"sheetData>row"`
}

func readPart(file *zip.File, target any) error {
	reader, err := file.Open()
	if err != nil {
		return err
	}
	defer reader.Close()
	return xml.NewDecoder(io.LimitReader(reader, 100<<20)).Decode(target)
}

func parseXlsx(data []byte) ([][]any, error) {
	archive, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	if err != nil {
		return nil, errors.New("Файл не похож на XLSX")
	}
	var sheets []*zip.File
	var stringsFile *zip.File
	for _, file := range archive.File {
		if strings.HasPrefix(file.Name, "xl/worksheets/sheet") && strings.HasSuffix(file.Name, ".xml") {
			sheets = append(sheets, file)
		}
		if file.Name == "xl/sharedStrings.xml" {
			stringsFile = file
		}
	}
	if len(sheets) == 0 {
		return nil, errors.New("В файле нет таблиц")
	}
	sort.Slice(sheets, func(i, j int) bool { return sheets[i].Name < sheets[j].Name })
	var shared []string
	if stringsFile != nil {
		var table stringTable
		if err := readPart(stringsFile, &table); err != nil {
			return nil, err
		}
		for _, item := range table.Items {
			text := item.Text
			for _, run := range item.Runs {
				text += run.Text
			}
			shared = append(shared, text)
		}
	}
	for _, sheet := range sheets {
		var xmlSheet worksheet
		if err := readPart(sheet, &xmlSheet); err != nil {
			continue
		}
		var rows [][]any
		for _, row := range xmlSheet.Rows {
			values := make([]any, 0, len(row.Cells))
			for i, cell := range row.Cells {
				column := 0
				for _, character := range cell.Ref {
					if character < 'A' || character > 'Z' {
						break
					}
					column = column*26 + int(character-'A'+1)
				}
				if column == 0 {
					column = i + 1
				}
				if column > 1024 {
					return nil, errors.New("Слишком широкая таблица")
				}
				for len(values) < column {
					values = append(values, nil)
				}
				indexInRow := column - 1
				switch cell.Type {
				case "s":
					index, err := strconv.Atoi(cell.Value)
					if err == nil && index >= 0 && index < len(shared) {
						values[indexInRow] = shared[index]
					}
				case "inlineStr":
					values[indexInRow] = cell.Inline.Text
				case "b":
					values[indexInRow] = cell.Value == "1"
				default:
					if number, err := strconv.ParseFloat(cell.Value, 64); err == nil {
						values[indexInRow] = number
					} else {
						values[indexInRow] = cell.Value
					}
				}
			}
			rows = append(rows, values)
		}
		for _, row := range rows {
			for _, value := range row {
				if value == "Дата операции" {
					return rows, nil
				}
			}
		}
	}
	return nil, errors.New("Не найдена таблица операций")
}

func parseCSV(data []byte) ([][]any, error) {
	data = bytes.TrimPrefix(data, []byte{0xef, 0xbb, 0xbf})
	if !utf8.Valid(data) {
		return nil, errors.New("Не удалось прочитать кодировку CSV")
	}
	for _, separator := range []rune{';', ',', '\t'} {
		reader := csv.NewReader(bytes.NewReader(data))
		reader.Comma = separator
		reader.FieldsPerRecord = -1
		rows, err := reader.ReadAll()
		if err != nil {
			continue
		}
		for _, row := range rows {
			found := 0
			for _, cell := range row {
				switch strings.TrimSpace(cell) {
				case "Дата операции", "Сумма в валюте счёта", "Валюта счёта", "Описание":
					found++
				}
			}
			if found == 4 {
				result := make([][]any, len(rows))
				for i, values := range rows {
					result[i] = make([]any, len(values))
					for j, value := range values {
						result[i][j] = value
					}
				}
				return result, nil
			}
		}
	}
	return nil, errors.New("Не найдены столбцы операций. Проверьте разделитель и заголовки CSV")
}

func parse(this js.Value, args []js.Value) any {
	if len(args) < 2 {
		return `{"error":"Файл не передан"}`
	}
	bytes := make([]byte, args[0].Get("length").Int())
	js.CopyBytesToGo(bytes, args[0])
	var rows [][]any
	var err error
	if args[1].String() == "csv" {
		rows, err = parseCSV(bytes)
	} else {
		rows, err = parseXlsx(bytes)
	}
	result := map[string]any{"rows": rows}
	if err != nil {
		result = map[string]any{"error": err.Error()}
	}
	encoded, _ := json.Marshal(result)
	return string(encoded)
}

func main() {
	js.Global().Set("parseFinanceFile", js.FuncOf(parse))
	select {}
}
