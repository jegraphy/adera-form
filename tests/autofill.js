// With the local preview open: playwright-cli run-code "$(cat tests/autofill.js)"
async (page) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const fill = page.getByRole('checkbox', { name: 'Remplir le formulaire avec des données de démonstration' });
  await fill.check();
  if (await page.locator('#first-name').inputValue() !== 'Camille') throw new Error('Profile was not filled');
  if (await page.locator('#address').inputValue() !== '12 rue des Facultés') throw new Error('Hidden billing fields were not filled');
  await fill.uncheck();
  if (await page.locator('#first-name').inputValue() !== 'Camille') throw new Error('Unchecking erased form data');
  await fill.check();
  for (const heading of ['À chacun ses Journées.', 'La rencontre continue.', 'On se voit à Bordeaux.']) {
    await page.getByRole('button', { name: 'Continuer', exact: true }).click();
    await page.getByRole('heading', { name: heading }).waitFor();
  }
  if (!(await page.locator('#review').innerText()).includes('525,00')) throw new Error('Gala total is incorrect');
  await fill.uncheck();
  await page.locator('#address').fill('Temporary edit');
  await fill.check();
  if (await page.locator('#address').inputValue() !== '12 rue des Facultés') throw new Error('Autofill failed on final step');
  await page.getByRole('button', { name: 'Confirmer mon inscription' }).click();
  await page.getByRole('heading', { name: 'À très bientôt, Camille.' }).waitFor();
  if (await page.locator('#ticket-name').innerText() !== 'Camille Dupont') throw new Error('Ticket name missing');
  if (await page.locator('#ticket-dates').innerText() !== '25—27') throw new Error('Ticket dates missing');
  if (!(await fill.isDisabled())) throw new Error('Completed registration can still be changed');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow at ${width}px`);
  }
  return { autofill: 'all four steps pass without additional input', ticket: '525 EUR, gala included', widths: [320, 390, 768, 1024, 1440] };
}
