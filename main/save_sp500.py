import bs4 as bs
import requests

from main.models import Profile, Ticker


def save_sp500_tickers():
    resp = requests.get('http://en.wikipedia.org/wiki/List_of_S%26P_500_companies')
    soup = bs.BeautifulSoup(resp.text, 'lxml')
    table = soup.find('table', {'class': 'wikitable sortable'})
    tickers = []
    companies = []
    for row in table.findAll('tr')[1:]:
        ticker = row.findAll('td')[0].text
        company = row.findAll('td')[1].text
        companies.append(company)
        tickers.append(ticker)

    return tickers, companies


def create_tickers_in_database():
    tickers, companies = save_sp500_tickers()

    for company, ticker in zip(companies, tickers):
        print(company, ticker)
        company = Ticker.objects.create(company=company, ticker_symbol=ticker)


def main():
    create_tickers_in_database()


if __name__ == "__main__":
    main()
