export function audioSourceFormData(source: File | string): FormData {
  const fd = new FormData();
  if (source instanceof File) {
    fd.append("file", source);
  } else {
    fd.append("url", source);
  }
  return fd;
}
