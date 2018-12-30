function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function getActiveLink() {
    // For whatever page you're on it will create a larger version of the page on the left side of the bar
    let navBarLinks = document.getElementsByClassName('link');
    let url = window.location.href;
    // Use this match to get the first string between forward slashes
    let pageName = url.match(/(\/[\w+-]+)/g)[1];
    pageName = pageName.substring(1, pageName.length);


    for (let link of navBarLinks) {
        let innerText = link.innerText;
        // If there is more than one word
        if (innerText.split(' ').length > 1) {
            let string = [];
            // Store the letters of the string in an array to check if it is the same as the page name
            for (let i = 0; i < innerText.length; i++) {
                if (innerText[i] !== ' ') {
                    string.push(innerText[i].toLowerCase());
                }
            }
            if (arraysEqual(string, pageName.split(''))) {
                // If the current webpage url matches with the navbar link, change the writing
                link.classList.add('active-link');
                document.getElementById('header').textContent = link.textContent.toUpperCase();
            }
        } else {
            if (innerText.toLowerCase() === pageName) {
                // If the current webpage url matches with the navbar link, change the writing
                link.classList.add('active-link');
                document.getElementById('header').textContent = link.textContent.toUpperCase();
            }
        }
    }

}

function getRedditData(allSubreddits) {
    return new Promise(resolve => {
        // Create a new snoowrap requester with OAuth credentials.
        // For more information on getting credentials, see here: https://github.com/not-an-aardvark/reddit-oauth-helper
        const r = new snoowrap({
            userAgent: 'Getting top posts',
            clientId: 'rRWtwi6h_Va6Aw',
            clientSecret: 'QiMW4kQ6ShNgsnG9ig8wCe_g-fk',
            username: 'reddit-bot-test-1234',
            password: 'password'
        });

        let promises = [];
        // Append the promises for each subreddit to an array
        allSubreddits.forEach(async (subredditName) => {
            let subreddit = r.get_subreddit(subredditName);
            promises.push(subreddit.getTop({time: 'week'}));
        });

        // Keeps track of the submissions which are of interest to us
        let submissions = [];

        let possibleFlairs = {'fundemental': null, 'stocks': null, 'dd': null, 'discussion': null, 'news': null};
        Promise.all(promises).then(results => {
            results.forEach(subreddit => {
                subreddit.forEach(submission => {
                    let flairType = submission.link_flair_text;
                    let subreddit = submission.subreddit.display_name;
                    let score = submission.score.toString();
                    if (score.length > 3) {
                        score = score[0] + "." + score[1] + "k";
                    }
                    let thumbnail = submission.thumbnail;
                    let numComments = submission.num_comments;
                    let title = submission.title;
                    let url = 'https://www.reddit.com' + submission.permalink;

                    // Make sure the flair type return is a string
                    if (typeof flairType === 'string') {
                        // Check to see if the flairtype is the one we want
                        if (flairType.toLowerCase() in possibleFlairs) {
                            if (thumbnail === 'self') {
                                thumbnail = null;
                            }
                            submissions.push([title, subreddit, score, numComments, url, thumbnail]);
                        }
                    }

                });

            });
            resolve(submissions);
        });


    });


}

function getFinancialData(tickers) {
    let promises = [];

    tickers.forEach(ticker => {
        promises.push(fetch(`https://api.iextrading.com/1.0/stock/${ticker}/time-series`))
    });

    Promise.all(promises).then(results => {
        Promise.all(results.map(result => result.json())).then(tickerInfo => {
            tickerInfo.map(ticker => JSON.stringify(ticker));
            tickerInfo.forEach((ticker, index) => {
                // Get information for the ticker for the latest day
                let tickerInfoLatestDay = ticker[ticker.length - 1];
                let priceTracker = document.getElementById(tickers[index]);
                if (tickerInfoLatestDay.changePercent < 0) {
                    priceTracker.innerText = priceTracker.innerText.replace('', `${tickerInfoLatestDay.close} (${tickerInfoLatestDay.changePercent.toFixed(2)}%)`);
                } else {
                    priceTracker.innerText = priceTracker.innerText.replace('', `${tickerInfoLatestDay.close} (+${tickerInfoLatestDay.changePercent.toFixed(2)}%)`);
                }
                if (tickerInfoLatestDay.changePercent < 0) {
                    priceTracker.style.color = 'red';
                } else {
                    priceTracker.style.color = 'green';
                }
            })
        })
    });
}

function getPastFinancialData(tickers, timePeriod) {
    if (!timePeriod) {
        alert('You have no set the time period for this function');
    } else {
        let promises = [];

        tickers.forEach(ticker => {
            promises.push(fetch(`https://api.iextrading.com/1.0/stock/${ticker}/chart/${timePeriod}`))
        });

        return new Promise(resolve => {
            Promise.all(promises).then(results => {
                Promise.all(results.map(result => result.json())).then(tickerInfo => {
                    let allTickerInfo = [];
                    tickerInfo.forEach((tickerInfo, index) => {
                        // Get information for the ticker for the latest day
                        allTickerInfo.push(tickerInfo);
                    });

                    resolve(allTickerInfo);
                })
            });
        });
    }

}

function loginPage() {
    getActiveLink();
}

function signupPage() {
    getActiveLink();
}


function homePage() {
    Vue.component('reddit-post', {
        props: ['title', 'score', 'subreddit', 'num_comments', 'post_url', 'thumbnail'],
        template:
            `    <div class="row ">
                        <div class="col reddit-card">
                            <div class="row">
                                <div style="width: 60px" class="upvote-arrow-wrapper">
                                    <div class="upvote-arrow-position">
                                        <i class="fas fa-arrow-up upvote-arrow-size"></i>
                                        <p class="upvote-arrow-size">{{ score }}</p>
                                    </div>
                                </div>
                                <template v-if="thumbnail">
                                <div class="col-2">
                                     <img style="margin-top: 23px;"  width="110" height="110" class="img-border-radius" id="post-image" :src="thumbnail" alt=""> 
                                </div>
                                
</template>
                                <div class="col-8">
                                    <div class="row mt-3">
                                        <div class="col">
                                            <h4 id="post-title" style="font-weight: bold">{{ title }}</h4>
                                        </div>
                                    </div>
                                    <!--<div class="row mt-1">-->
                                        <!--<div class="col">-->
                                            <p style="margin-bottom:7px;">/r/{{ subreddit }}</p>
                                        <!--</div>-->
                                    <!--</div>-->
                                    <div class="row pb-5">
                                        <div class="col">

                                            <a v-bind:href="post_url" style="margin-right: 10px;">View Post</a> <i
                                                class="fas fa-comment-alt"></i> <span>{{num_comments}} Comments</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`
    });

    Vue.component('reddit-posts', function (resolve, reject) {
        let subredditsToCheck = ['wallstreetbets', 'investing', 'securityanalysis', 'stocks', 'stockmarket'];
        // Pass the component definition to the resolve callback
        getRedditData(subredditsToCheck).then(result => {
            let loader = document.getElementById('loader');
            loader.style.display = 'none';
            resolve({
                data: function () {
                    return {
                        submissions: result
                    }
                },
                methods: {
                    showMore: function () {
                        let redditPosts = document.getElementsByClassName('reddit-post');
                        let shownCounter = 0;
                        // Count number of posts which are being shown currently
                        for (let i = 0; i < redditPosts.length; i++) {
                            if (redditPosts[i].style.display !== 'none') {
                                shownCounter++
                            }
                        }
                        // Turn on the next posts 3
                        for (let i = shownCounter + 1; i < shownCounter + 4; i++) {
                            redditPosts[i].style.display = 'flex';
                        }
                    },
                    scrollToTop: function () {
                        window.scrollTo(0, 0);
                    }
                },
                template: `
                <div>
                
                <reddit-post v-for="(submission, index) in submissions" :key="index" :style="[index>2?{'display':'none'}:'']"  id="original" v-bind:class="[index===0?'mt-3':'my-3', 'reddit-post']" class="" v-bind:title="submission[0]" v-bind:score="submission[2]"
                v-bind:num_comments="submission[3]" v-bind:subreddit="submission[1]"
                v-bind:post_url="submission[4]" v-bind:thumbnail="submission[5]"></reddit-post>
                
                <button type="button" @click="showMore" class="more-results-button" id="more-results">More Results</button>
                <button type="button" @click="scrollToTop" class="to-top-button ml-2" id="more-results">Back to top</button>
                </div>`
            })
        });
    });

    let app = new Vue({
        el: '#app',
        beforeCreate: function () {
        },
        created: function () {
            let profileTickers = document.getElementsByClassName('account-ticker');
            let tickers = [];
            for (let ticker of profileTickers) {
                tickers.push(ticker.innerText);
            }
            let closingPriceMarkers = document.getElementsByClassName('ticker-price');
            getPastFinancialData(tickers, '5y').then(result => {
                result.forEach((tickerData, index) => {
                    let latestDayInfo = tickerData[tickerData.length - 1];

                    if (latestDayInfo.changePercent < 0) {
                        closingPriceMarkers[index].innerText = `${latestDayInfo.close} (${latestDayInfo.changePercent.toFixed(2)}%)`;
                    } else {
                        closingPriceMarkers[index].innerText = `${latestDayInfo.close} (+${latestDayInfo.changePercent.toFixed(2)}%)`;
                    }
                    if (latestDayInfo.changePercent < 0) {
                        closingPriceMarkers[index].style.color = 'red';
                    } else {
                        closingPriceMarkers[index].style.color = 'green';
                    }
                })
            });
        },
        data: function () {
            return {}
        },
        computed: {},
        methods: {}
    });

    getActiveLink();
    let tickers = ['voo', 'dia'];
    getFinancialData(tickers);

}

function findSimilarTickerToUserInput(userInput, tickerArray) {
    let similarTickers = [];
    tickerArray.forEach(ticker => {
        // If the first letter up to the length of the user input match
        if (userInput === ticker.substring(0, userInput.length).toLowerCase()) {
            similarTickers.push(ticker);
        }
    });
    return similarTickers
}

function getAvailableTickers() {
    let url = document.getElementById('ticker-url').getAttribute('data-url');
    return new Promise(resolve => {
        fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then((tickers) => {
                let jsonInfo = [tickers.companies, tickers.company_tickers];
                resolve(jsonInfo);
            });
    });
}

function underlinePartOfWord(self, tickers) {
    Vue.nextTick(function () {
        let tickerTags = document.getElementsByClassName('tickers');
        let index = 0;
        for (let ticker of tickerTags) {
            // We underline only the part which matches the user input. E.g. if user input is 'a' but matching ticker is
            // 'aapl' we would only underline the first 'a'.
            ticker.innerHTML = `<u>${tickers[index].substring(0, self.ticker.length)}</u>${tickers[index].substr(self.ticker.length, tickers[index].length)}`;
            index += 1;
        }
    })

}

function postData(url = ``, data, csrfToken) {
    // Default options are marked with *
    return fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-CSRFToken": csrfToken,
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
        .then(response => response.json()); // parses response to JSON
}

function plotChart(dateData, dataArray) {
    let ctx = document.getElementById("myChart").getContext('2d');
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateData[0],
            datasets: dataArray,
        },
        options: {
            responsive: true,
            elements: {
                point: {
                    radius: 0
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Stock Price ($)'
                    }
                }]
            }
        }
    });

    let resultsButton = document.getElementById('results-button');
    resultsButton.addEventListener('click', () => {
        myChart.destroy();
    })
}

function portfolioPage() {
    let vue = new Vue({
        el: '#app',
        created: function () {
            let xButtons = document.getElementsByClassName('x-button');
            this.numTickersChosen = xButtons.length;
            let getResultsButton = document.getElementById('get-results-button');
            // We show the getResultsButton if there are tickers chosen
            if (this.numTickersChosen > 0) {
                getResultsButton.style.display = 'inline-block';
            } else {
                getResultsButton.style.display = 'none';
            }

        },
        data: {
            ticker: '',
            companyArray: '',
            companyTickerMap: null,
            similarTickers: '',
            numTickersChosen: 0,
            availableTimeOptions: ['1d', '1m', '3m', '6m', 'ytd', '1y', '2y', '5y']

        },
        computed: {
            tickerInput: function () {
                if (this.companyArray === '') {
                    getAvailableTickers().then(
                        result => {
                            this.companyArray = result[0];
                            this.companyTickerMap = result[1];
                        },
                    )
                } else {
                    let liveSearch = document.getElementById('live-search');
                    // An array of tickers matching the user input
                    let similarTickers = findSimilarTickerToUserInput(this.ticker.toLowerCase(), this.companyArray);

                    if (this.ticker.length > 0 && similarTickers.length > 0) {
                        this.similarTickers = similarTickers;
                        liveSearch.style.border = "1px solid rgb(165, 172, 178)";
                        let self = this;
                        underlinePartOfWord(self, similarTickers);
                    } else {
                        this.similarTickers = '';
                        liveSearch.style.border = 'none';
                    }

                }
            },
            tickerChosenAmount: function () {
                let searchBar = document.getElementById('search-bar');
                searchBar.disabled = (this.numTickersChosen > 4);

                let getResultsButton = document.getElementById('get-results-button');
                if (this.numTickersChosen > 0) {
                    getResultsButton.style.display = 'inline-block';
                } else {
                    getResultsButton.style.display = 'none';
                }
            },
        },
        methods: {
            removeSimilarTickers: function () {
                this.similarTickers = '';
                let liveSearch = document.getElementById('live-search');
                liveSearch.style.border = 'none';
            },
            addSelected: function (event) {
                let currentSelected = document.getElementsByClassName('selected-time-option');
                for (let selected of currentSelected) {
                    selected.classList.remove('selected-time-option');
                }
                event.target.classList.add('selected-time-option');
                document.getElementById('results-button').disabled = false;

            },
            addData: function (event) {
                // add a ticker when it has been clicked on
                let marker = document.getElementById('data-tickers');
                let divElement = document.createElement('SPAN');
                divElement.classList.add('ticker-chosen-wrapper');
                let spanElement = document.createElement('SPAN');
                spanElement.innerText = event.target.innerText;
                spanElement.classList.add('ticker-chosen');
                spanElement.style.display = 'inline-block';
                let crossElement = document.createElement('I');
                crossElement.classList.add('fas');
                crossElement.classList.add('fa-times');
                divElement.appendChild(spanElement);
                divElement.appendChild(crossElement);

                // Reset the value of the input field
                this.ticker = '';

                // If the x butotn is clicked remove self from the page
                crossElement.addEventListener('click', (event) => {
                    let removalMarker = document.getElementById('data-tickers');
                    // Remove the ticker for which the cross button was clicked
                    let elementToRemove = event.target.parentElement;
                    removalMarker.removeChild(elementToRemove);
                    this.numTickersChosen -= 1;
                });

                marker.appendChild(divElement);
                // Keeps track of how many tickers are chosen so we increment 1
                this.numTickersChosen += 1;
            },
            deleteSelf: function (event) {
                // Allow x button to delete the ticker which it is attached to
                let removalMarker = document.getElementById('data-tickers');
                // Remove the ticker for which the cross button was clicked
                let elementToRemove = event.target.parentElement;
                removalMarker.removeChild(elementToRemove);
                this.numTickersChosen -= 1;
            },
            getData: function () {
                let getChosenTickers = document.getElementsByClassName('ticker-chosen');
                let tickers = [];
                for (let i = 0; i < getChosenTickers.length; i++) {
                    let company = getChosenTickers[i].innerText;
                    let ticker = this.companyTickerMap[company];
                    tickers.push(ticker);
                }

                // Post the data so that it is saved to the user's profile
                let url = document.getElementById('update-ticker-profile-url').getAttribute('data-url');
                let data = {'tickers': tickers};
                let csrftoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
                postData(url, data, csrftoken);

                // Time option is what period of time we want the data for e.g. 1d, 5y, etc...
                let timeOption = document.getElementsByClassName('selected-time-option')[0].innerText;
                // Gets the time series data for the tickers so that we can plot them
                getPastFinancialData(tickers, timeOption).then(results => {

                    let dateData = [];
                    let closingPriceData = [];

                    results.forEach((tickerData, index) => {
                        // For each ticker...
                        let date = [];
                        let closingPrice = [];
                        tickerData.forEach(day => {
                            // For each day for each ticker...
                            date.push(day.date);
                            closingPrice.push(day.close);
                        });
                        dateData.push(date);
                        closingPriceData.push(closingPrice);
                    });

                    // Template object so that it can be used to get
                    let genericDataObject = {
                        label: null,
                        data: null,
                        // backgroundColor: [
                        //     'rgba(255, 99, 132, 0.2)',
                        // ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                        ],
                        borderWidth: 1.5,
                        fill: false,
                    };
                    // Contains each data object for each ticker containing the closing prices for each day
                    let dataArray = [];
                    closingPriceData.forEach((closingPrice, index) => {
                        let newObject = Object.assign({}, genericDataObject);
                        newObject.data = closingPrice;
                        newObject.label = tickers[index];
                        let color = `rgba(${Math.floor(Math.random() * 250)},${Math.floor(Math.random() * 250)},${Math.floor(Math.random() * 250)},1)`;
                        newObject.backgroundColor = color;
                        newObject.borderColor = color;
                        dataArray.push(newObject);
                    });

                    plotChart(dateData, dataArray);

                });
            },
        }
    });

    getActiveLink();


}