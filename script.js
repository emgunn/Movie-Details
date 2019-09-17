/**
 * Movie/TV List
 * =============
 * 
 * Current features:
 * -----------------
 * - Loads a single movie/show or returns a list of results for user to choose from
 * - Simple UI
 * - Uses OMDb API/IMDb
 */

const app = document.getElementById('root');

const container = document.getElementById('cards');

app.appendChild(container);


let protocol = "https://"
let domain = 'www.omdbapi.com/';
let queryType;
let query;
let apiTag = '&apikey=';
let apiKey = '';

let cards = 0;

//set references to HTML elements
const input = document.getElementById("search");
const movie = document.getElementById('movie');
const poster = document.getElementById('poster');
const queryMsg = document.getElementById('query1');
const yourQuery = document.getElementById('query2');
const resultList = document.getElementById('resultList');
const navigator = document.getElementById('navigator');

//execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  //13 is the 'enter' key
  if (event.keyCode === 13) {
    //cancel default action, if needed
    event.preventDefault();
    //trigger button with click
    document.getElementById("searchButton").click();
  }
});

function removeCards() {
  //remove previous cards
  container.innerHTML = '';
  cards = 0;
}

function removePoster() {
  poster.innerHTML = '';
  document.getElementById('poster').setAttribute('src', '');
  document.getElementById('poster').setAttribute('alt', '');
}

function removeQueryHTML() {
  queryMsg.innerHTML = '';
  yourQuery.innerHTMl = '';
}

function removeResultList() {
  resultList.innerHTML = '';
}

function removeNavigatorButtons() {
  navigator.innerHTML = '';
}

//clears HTML elements that should be replaced with every search
function clearAll() {
  removeCards();
  removePoster();
  removeQueryHTML();
  removeResultList();
  removeNavigatorButtons();
}

function idSearch(queryId) {
  query = queryId;
  queryType = '?i=';
  processRequest();
}

function nameSearch() {
  query = input.value;
  queryType =  '?t=';
  processRequest();
}

//handles a search with exact name
function processRequest() {

  //don't make a http request if search bar is empty
  if(query != '' && query != null) {
  
    let request = new XMLHttpRequest();

    let url = protocol + domain + queryType + query + apiTag + apiKey;

    console.log(url);
    request.open( "GET", url, true );            
    request.send();

    request.onreadystatechange = processRequest;

    let response = null;
    let data = null;
    function processRequest(e) {

      if (request.readyState == 4 && request.status == 200) {
        response = request.responseText;
        console.log(response);
        data = JSON.parse(request.responseText);
        let listKeys = Object.keys(data);

        //clear the board
        clearAll();

        if(data['Response'] === 'False') {
          //if movie does not exist
          if(data['Error'] === 'Movie not found!') {
            movie.innerHTML = 'Movie not found...';
            movie.style.color = 'red';
            queryMsg.innerHTML = 'You searched for: ';
            queryMsg.style.color = 'gray';
            yourQuery.innerHTML = '\'' + query + '\'';
            yourQuery.style.color = 'gray';
          }
          //if daily request quota exceeded (1,000 daily)
          else {
            var errorMsg = 'Failed to fetch data with OMDb API. '
              + 'Quota exceeded (1,000 daily).'
            console.log(errorMsg);
            movie.innerHTML = errorMsg;
            movie.style.color = 'red';
          }
        }

        //if valid movie was entered
        else {
          for(var i = 0; i < listKeys.length; i++) {
            if(listKeys[i] != 'Title') {

              //make cards hover expandable
              
              const card = document.createElement('div');
            
              card.setAttribute('class', 'card');
            
              const h1 = document.createElement('h1');
              h1.textContent = listKeys[i];

              //ignore response card
              if(listKeys[i] === 'Response') {
              }

              if(listKeys[i] === 'imdbID') {
                card.appendChild(h1);
                const p = document.createElement('p');
                let imdb = `${data[listKeys[i]]}`;
                p.innerHTML = imdb.link('https://www.imdb.com/title/' + imdb);
                card.appendChild(p);
              }
              //make clickable url
              else if(listKeys[i] === 'Poster') {
                if(`${data[listKeys[i]]}` === 'N/A') {
                  card.appendChild(h1);
                  const p = document.createElement('p');
                  p.innerHTML = 'None';
                  card.appendChild(p);
                } 
                else {
                  card.appendChild(h1);
                  const p = document.createElement('p');
                  p.innerHTML = 'Link'.link(`${data[listKeys[i]]}`);
                  card.appendChild(p);

                  poster.setAttribute('src', data['Poster']);
                  poster.setAttribute('alt', data['Title']) + ' poster';
                }
              }
              //parse json array for ratings
              else if(listKeys[i] === 'Ratings') {
                if(`${data[listKeys[i]]}`.length == 0) {
                  card.appendChild(h1);
                  const p = document.createElement('p');
                  p.innerHTML = 'None';
                  card.appendChild(p);
                }
                else {
                  card.appendChild(h1);
                  let ratings = '';
                  console.log(data.Ratings);
                  data.Ratings.forEach(element => {
                    const p = document.createElement('p');
                    ratings = element.Source + ': ' + element.Value;
                    p.textContent = ratings;
                    card.appendChild(p);
                  });
                }
              }
              //make website link clickable
              else if(listKeys[i] === 'Website') {
                if(`${data[listKeys[i]]}` === 'N/A') {
                  card.appendChild(h1);
                  const p = document.createElement('p');
                  p.innerHTML = 'None';
                  card.appendChild(p);
                }
                else {
                  card.appendChild(h1);
                  const p = document.createElement('p');
                  let website = `${data[listKeys[i]]}`;
                  p.innerHTML = website.link(website);
                  card.appendChild(p);
                }
              }
              else {
                const p = document.createElement('p');
                p.textContent = `${data[listKeys[i]]}`;
                card.appendChild(h1);
                card.appendChild(p);
              }
              container.appendChild(card);
              cards++;
            }
          }
          movie.innerHTML = '"' + data['Title'] + '" (' + data['Year'] + ' ' 
            + data['Type'] + ')';
          //movie.style.color = 'rgb(61, 172, 236)';
          movie.style.color = 'rgb(61, 236, 70)';
        }
      }
    }
  }
}


//handles retrieving a list a results related to a search keyword
function seeMore(pageNumber) {

  query = input.value;

  yourQuery.innerHTML = '';

  if(query != '' && query != null) {
    clearAll();
  
    movie.innerHTML = 'Search results for "' + query + '":'
    movie.style.color = 'yellow';

    let request = new XMLHttpRequest();

    let url = protocol + domain + '?s=' + query + '&page=' + pageNumber + apiTag + apiKey;

    console.log(url);
    request.open( "GET", url, true );            
    request.send();

    request.onreadystatechange = processRequest;

    let response = null;
    let data = null;
    function processRequest(e) {

      if (request.readyState == 4 && request.status == 200) {

        response = request.responseText;
        console.log(response);
        data = JSON.parse(request.responseText);
        let listKeys = Object.keys(data);

        let totalPages = parseInt((parseInt(data['totalResults'], 10) / 10)) + 1;
        queryMsg.innerHTML = 'Page ' + pageNumber + ' of ' 
          + totalPages;
        queryMsg.style.color = 'black';

        //if fail
        if(data['Response'] === 'False') {
          queryMsg.innerHTML = data['Error'];
          queryMsg.style.color = 'red';
          yourQuery.innerHTML = '';
        }
        else {
          let results = data['Search'];

          results.forEach(function(element) {
            const entry = document.createElement('li');
            
            entry.setAttribute('class', 'listItem');
            entry.innerHTML = element['Title'] + ' (' + element['Year'] + ' ' 
            + element['Type'] + ')';
    
            entry.onclick = function() {
              idSearch(element['imdbID']);
            }

            resultList.appendChild(entry);
          });

          removeNavigatorButtons();

          if(pageNumber > 1) {
            const prevPage = document.createElement('button');
            prevPage.className = 'button';
            prevPage.innerHTML = 'Previous page';
            prevPage.style.width = '20%';
            prevPage.style.marginRight = '0.5rem';
            prevPage.style.marginLeft = '0.5rem';

            prevPage.onclick = function() {
              seeMore(pageNumber - 1);
            }

            navigator.appendChild(prevPage);
          }

          if(pageNumber <= totalPages) {
            const nextPage = document.createElement('button');
            nextPage.className = 'button';
            nextPage.innerHTML = 'Next page';
            nextPage.style.width = '20%';
            nextPage.style.marginRight = '0.5rem';
            nextPage.style.marginLeft = '0.5rem';

            nextPage.onclick = function() {
              seeMore(pageNumber + 1);
            }
            
            navigator.appendChild(nextPage);
          }
          
        }
      }
    }
  }
}
