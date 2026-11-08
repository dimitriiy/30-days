# Bank file parser in WebAssembly

`parser.go` uses Go's standard library to unzip an XLSX file and read worksheet XML, or to parse CSV with comma, semicolon, or tab separators. The browser loads the compiled WASM module in `wasm-client.ts`, passes the file bytes and format to it, and receives rows as JSON. UTF-8 and Windows-1251 CSV files are supported. `model.ts` then interprets bank transactions and calculates the dashboard data.

The generated files in `public/` are checked in so the Next.js build does not require Go. To rebuild them with Go 1.27:

```sh
GOOS=js GOARCH=wasm go build -trimpath -ldflags='-s -w' -o public/finance-parser.wasm app/finance/wasm/parser.go
cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" public/finance-wasm-exec.js
```

The Go runtime JS must come from the same Go version as the WASM binary.
