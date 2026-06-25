export function getQueryParam(name: string) {
  return new URLSearchParams(window.location.search).get(name) || '';
}
