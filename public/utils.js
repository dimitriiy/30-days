const generateMonth = () => Array.from({ length: 31 }, (_, i) => i).slice(1);

const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
