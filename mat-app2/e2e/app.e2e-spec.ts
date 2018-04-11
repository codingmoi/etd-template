import { MatApp2Page } from './app.po';

describe('a App', () => {
  let page: MatApp2Page;

  beforeEach(() => {
    page = new MatApp2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
