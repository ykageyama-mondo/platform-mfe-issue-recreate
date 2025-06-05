import { chromium } from 'playwright';
import 'dotenv/config'

let iterations = 0;

const run = async () => {
  iterations++;
  const browser = await chromium.launch({
    headless: true, // Set to false if you want to see the browser
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  let step = 'Loading page'

  page.on('console', (msg) => {
    if (msg.type() !==  'error') {
      return;
    }

    if (msg.text().includes('Minified React error')) {
      console.error(`Error in iteration ${iterations}. Failed at step ${step}:\n`, msg.text());
      process.exit(1);
    }
  })

  await page.goto(process.env.URL!);


  step = 'Logging in';

  await page.getByPlaceholder('Email').fill(process.env.EMAIL!)
  await page.getByPlaceholder('Password').fill(process.env.PASSWORD!)

  await page.locator('button[type="submit"]', {hasText: 'Sign in'}).click()

  step = 'Loading dashboard';


  await page.waitForLoadState('networkidle');

  step = 'Navigating to Analysis';

  await page.locator('a', {hasText: 'Analysis'}).click()

  step = 'Loading analysis page';

  await page.waitForURL('**/analysis');

  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(2_000);

  page.removeAllListeners();

  await browser.close();

}

const main = async () => {

  while(true) {
    await run()
  }

}
main()