export const setThemeOnBody = (theme: string) => {
  if (!theme) {
    return; //preserve existing theme
  }
  const body = document.body;
  if (body.classList.value) {
    body.classList.replace(body.classList.value, theme);
  } else {
    body.classList.add(theme);
  }
};

export default setThemeOnBody;
