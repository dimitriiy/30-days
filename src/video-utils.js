import ytdl from '@distube/ytdl-core';

/**
 * Получает информацию о видео с YouTube и список качеств
 * @param {string} url - YouTube URL
 * @returns {Promise<Object>} Объект с информацией о видео и доступными качествами
 */
async function getYoutubeVideoData(url) {
  try {
    // Валидация URL
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL');
    }

    // Получаем полную информацию о видео
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;
    const formats = info.formats;

    // Получаем уникальные качества видео
    const qualities = getAvailableQualities(formats);

    // Загружаем лучший thumbnail и конвертируем в blob
    const thumbnail = await getThumbnailAsBlob(videoDetails.thumbnails);

    // Формируем данные для фронтенда
    return {
      success: true,
      video: {
        id: videoDetails.videoId,
        title: videoDetails.shortTitle || videoDetails.title,
        duration: videoDetails.lengthSeconds,
        description: videoDetails.shortDescription,
        author: videoDetails.author.name,
        channelId: videoDetails.channelId,
        viewCount: videoDetails.viewCount,
        publishDate: videoDetails.publishDate,
        // Один объект thumbnail с blob данными
        thumbnail: thumbnail,
      },
      qualities, // Список доступных качеств с ссылками
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Загружает лучший thumbnail и возвращает blob
 * @param {Array} thumbnails - Массив thumbnail объектов от YouTube
 * @returns {Promise<Object>} Объект с blob и метаданными
 */
async function getThumbnailAsBlob(thumbnails) {
  try {
    // Берем последний (самый качественный) thumbnail
    const bestThumb = thumbnails[thumbnails.length - 1];

    if (!bestThumb || !bestThumb.url) {
      throw new Error('No thumbnail available');
    }

    // Загружаем изображение
    const response = await fetch(bestThumb.url);

    // const b64 = await fetch(url)
    //   .then((response) => response.buffer())
    //   .then((buffer) => {
    //     const b64 = buffer.toString('base64');
    //     return b64;
    //   })
    //   .catch(console.error);

    if (!response.ok) {
      throw new Error(`Failed to fetch thumbnail: ${response.status}`);
    }

    // Конвертируем в blob
    const buffer = await response.arrayBuffer();

    const b64 = Buffer.from(buffer).toString('base64');

    return {
      url: bestThumb.url, // Оригинальный URL для ссылки
      width: bestThumb.width,
      height: bestThumb.height,
      b64, // Blob данные
    };
  } catch (error) {
    console.error('Error loading thumbnail:', error);
    // Fallback - возвращаем дефолтный thumbnail YouTube
    return {
      url: 'https://i.ytimg.com/vi/default/maxresdefault.jpg',
      width: 1280,
      height: 720,
      dataUrl: null,
      error: error.message,
    };
  }
}

/**
 * Извлекает доступные качества видео из списка форматов
 * @param {Array} formats - Массив форматов от ytdl.getInfo
 * @returns {Array} Массив объектов с качеством и ссылкой
 */
function getAvailableQualities(formats) {
  const qualitiesMap = new Map();

  // 1. Добавляем форматы с видео и аудио (лучше для скачивания)
  const videoAudioFormats = formats.filter((f) => f.hasVideo && f.hasAudio && f.url);

  videoAudioFormats.forEach((format) => {
    const quality = format.qualityLabel || format.height + 'p';
    const key = quality;

    if (!qualitiesMap.has(key)) {
      qualitiesMap.set(key, {
        label: quality,
        quality,
        url: format.url,
        itag: format.itag,
        mimeType: format.mimeType,
        bitrate: format.bitrate,
        fps: format.fps,
        hasVideo: true,
        hasAudio: true,
        container: format.container,
      });
    }
  });

  // 2. Для высоких качеств (1080p+) где может не быть аудио
  const highQualityVideo = formats.filter((f) => f.hasVideo && !f.hasAudio && f.url);

  const audioFormat = formats.find((f) => f.hasAudio && !f.hasVideo && f.url && f.mimeType.includes('audio'));

  if (highQualityVideo.length > 0 && audioFormat) {
    highQualityVideo.forEach((format) => {
      const quality = format.qualityLabel;
      const key = quality;

      if (quality && !qualitiesMap.has(key)) {
        qualitiesMap.set(key, {
          label: quality,
          quality,
          videoUrl: format.url,
          audioUrl: audioFormat.url,
          itag: format.itag,
          mimeType: format.mimeType,
          bitrate: format.bitrate,
          fps: format.fps,
          hasVideo: true,
          hasAudio: false,
          audioMimeType: audioFormat.mimeType,
          container: format.container,
          note: 'Requires merging video and audio via ffmpeg',
        });
      }
    });
  }

  // 3. Сортируем по приоритету
  const qualityOrder = ['1080p', '720p', '480p', '360p', '240p', '144p'];

  const sorted = Array.from(qualitiesMap.values()).sort((a, b) => {
    const aIndex = qualityOrder.indexOf(a.label);
    const bIndex = qualityOrder.indexOf(b.label);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  // Убираем дубликаты
  const result = [];
  const seenQualities = new Set();

  sorted.forEach((quality) => {
    if (!seenQualities.has(quality.label)) {
      seenQualities.add(quality.label);
      result.push(quality);
    }
  });

  return result;
}

/**
 * Получает прямую ссылку на видео определенного качества
 * @param {string} url - YouTube URL
 * @param {string} quality - Желаемое качество (например: '720p', '360p')
 * @returns {Promise<Object>} Объект с URL для скачивания
 */
async function getVideoDownloadUrl(url, quality = 'highest') {
  try {
    const info = await ytdl.getInfo(url);
    let format;

    if (quality === 'highest' || quality === 'auto') {
      format = ytdl.chooseFormat(info.formats, {
        quality: 'highest',
        filter: (f) => f.hasVideo && f.hasAudio,
      });
    } else {
      format = info.formats.find(
        (f) => (f.qualityLabel === quality || f.height + 'p' === quality) && f.hasVideo && f.hasAudio
      );

      if (!format) {
        format = info.formats.find((f) => (f.qualityLabel === quality || f.height + 'p' === quality) && f.hasVideo);
      }

      if (!format) {
        format = ytdl.chooseFormat(info.formats, {
          quality: 'highest',
        });
      }
    }

    return {
      success: true,
      downloadUrl: format.url,
      quality: format.qualityLabel || `${format.height}p`,
      mimeType: format.mimeType,
      container: format.container,
      size: format.contentLength,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export { getYoutubeVideoData, getAvailableQualities, getVideoDownloadUrl };
