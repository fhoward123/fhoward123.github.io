const DEBUG  = true;
const DEBUG2 = true;
const showSearch = 'search/shows?q=';
const api = 'https://api.tvmaze.com/';

let seriesID = 0;
let numOfSeasons = 0;
let allSeasons = {};
let seasons = [];
let allEpisodesForSeason = {};
let seriesData = {};
let seasonNumber = 0;
let seasonID = 0;
let seasonStart = '';
let seasonEnd = '';
let episodes = [];
let eleID = '';
let $modelID = '';
let $searchResults = [];
const allShows = {};
let noEpisodes = false;

const buildModalData = function(seriesInfo) {
    if (DEBUG) console.log('INSIDE buildModalData');
    const $ul = $('<ul>')
        .addClass('summary-text')
        .addClass('summary-list');

    let $li = $('<li><span class="heading">Status: </span>' + seriesInfo.status + '</li>');
    $($ul).append($li);
    if (DEBUG) console.log(`schedule string: "${seriesInfo.schedule}"`);

    seriesInfo.schedule = seriesInfo.schedule == 'undefined ' ? 'N/A' : seriesInfo.schedule;
    // $li = $('<li>').text(`Schedule: ${seriesInfo.schedule}`);
    $li = $('<li><span class="heading">Schedule: </span>' + seriesInfo.schedule + '</li>');
    $($ul).append($li);
    // $li = $('<li>').text(`Premiered: ${seriesInfo.premiered}`);
    $li = $('<li><span class="heading">Premiered: </span>' + seriesInfo.premiered + '</li>');
    $($ul).append($li);
    // $li = $('<li>').text(`Network: ${seriesInfo.network}`);
    $li = $('<li><span class="heading">Network: </span>' + seriesInfo.network + '</li>');

    $($ul).append($li);
    // Append UL after summary paragraph
    $('.summary-p').append($ul);
    $('li').css('list-style-type', 'none');
};

const onSeasonClick = function(event) {
    if (DEBUG) console.log('INSIDE onSeasonClick');
    const eleID = $(event.currentTarget).attr('id');
    seasonID = allSeasons[eleID].id;
    const seasonStartDate = allSeasons[eleID].premiereDate;
    const seasonEndDate = allSeasons[eleID].endDate;
    seasonNumber = allSeasons[eleID].number;

    if ( ! seasonStartDate  &&  ! seasonEndDate ) {
        noEpisodes = true;
    }
    getSeasonInfo();
};

const makeSeasonBtns = function(tvDataArr) {
    if (DEBUG) console.log('INSIDE makeSeasonBtns');
    // remove old buttons to display new query results
    $('.season-btns').remove();
    // Clear input box after closing modal
    $('#input-form').find('input:text').val('');
    seasons = [];

    tvDataArr.forEach(function(season, i) {
        if (DEBUG) console.log('INSIDE callback for makeSeasonBtns');
        numOfSeasons = i + 1;
        allSeasons[`season${numOfSeasons}`] = season;
        if (DEBUG) console.log(`Season ${numOfSeasons}: ID# ${allSeasons[`season${numOfSeasons}`].id}`);
        seasons.push(`season${numOfSeasons}`);
        eleID = `season${numOfSeasons}`;

        const seasonStartDate = allSeasons[eleID].premiereDate;
        const seasonEndDate = allSeasons[eleID].endDate;
        const network = allSeasons[eleID].network.name;
        const numOfEpisodes = allSeasons[eleID].episodeOrder;
        const seriesNameTmp = allSeasons[eleID].name;

        let episodesText1 = '';
        let episodesText2 = '';
        if (numOfEpisodes) {
            episodesText1 = `consisted of ${numOfEpisodes} episodes and `;
        }
        if ( seasonStartDate  &&  seasonEndDate ) {
            episodesText2 = `from ${seasonStartDate} thru ${seasonEndDate}`;
        }

        if (DEBUG) console.log(`Season started ${seasonStartDate} and ended ${seasonEndDate}`);

        const $seasonBtn = $('<input>')
            .addClass('season-btns')
            .attr('type', 'button')
            .attr('id', `season${numOfSeasons}`)
            .attr('value', `Season ${numOfSeasons}`)
            .attr('title', `Season ${numOfSeasons} of ${seriesData.name} ${episodesText1}ran ${episodesText1}on ${network}`);

        $('#season-btns').append($seasonBtn);
    });
    if (DEBUG) console.log(allSeasons);
    if (DEBUG) console.log(seasons);
    // Setup listener for when a season button is clicked
    $('.season-btns').on('click', onSeasonClick);
}

const getAllSeasons = function() {
    if (DEBUG) console.log('INSIDE getAllSeasons');
    const queryPath = `shows/${seriesID}/seasons`;
    // AJAX method
    const promise = $.ajax({
        url:api + queryPath
    });

    promise.then(
        // Success Callback function
        function(tvDataArr) {
            if (DEBUG) console.log('running callback function for getAllSeasons');
            // Object of collected series info
            const seasonsData = tvDataArr[0];
            // const seasonImages = {};
            makeSeasonBtns(tvDataArr);
        },
        // Failure Callback function
        function() {
            console.log('bad request');
        }
    );
};

const closeEpisodeModal = () => {
    if (DEBUG) console.log('INSIDE closeEpisodeModal');
    $modal.css('display', 'none');
    // Remove old data from modal
    $('.summary-text').remove();
    $('.summary-list').remove();
    $('.summary-p').remove();
}

const closeSeriesModal = () => {
    if (DEBUG) console.log('INSIDE closeSeriesModal');
    $modal.css('display', 'none');
    // Remove old data from modal
    $('.summary-text').remove();
    $('.summary-list').remove();
    $('.summary-p').remove();

    getAllSeasons();
}

const openModal = () => {
    if (DEBUG) console.log('INSIDE openModal');
    $modal.css('display', 'block');
};

const setupModal = function(seriesInfo) {
    if (DEBUG) console.log('INSIDE setupModal');
    // Remove old data from modal
    $('.summary-text').remove();
    $('.summary-list').remove();
    $('.summary-p').remove();

    // Strip out the HTML embedded in the summaries
    const summary = seriesInfo.seriesSummary.replace(/<\/?[^>]+(>|$)/g, "");
    const $pSummary = $('<p>').addClass('summary-text').addClass('summary-p').text(summary);
    $pSummary.insertAfter('#show-title');
    if (DEBUG) console.log(`Series Name: ${seriesInfo.name}`);
    $('#show-title').text(seriesInfo.name);
    $modal = $('#modal');
    buildModalData(seriesInfo);
    setTimeout(openModal, 2300);
};
$('.close').on('click', closeSeriesModal);

const getSeriesInfo = function(event) {
    if (DEBUG) console.log('INSIDE getSeriesInfo');
    seriesID = $(event.currentTarget).attr('value');

    // Remove select option menu
    $('#show-container').remove();
    $('.series-options').remove();
    $('label').remove();

    if (DEBUG) console.log(`Click value: ${seriesID}`);
    // Object to hold gleaned data from TVMaze
    seriesData = {};
    // Hardcoded to first result for testing --- NEED TO FIX ***********
    const showIdx = allShows[seriesID];
    seriesID = seriesData.id = searchResults[showIdx].show.id;
    if (DEBUG) console.log(`Series ID: ${seriesData.id}`);
    seriesData.name = searchResults[showIdx].show.name;
    if (DEBUG) console.log(`Series Name: ${seriesData.name}`);
    if (DEBUG) console.log(searchResults[showIdx]);
    if (searchResults[showIdx].show.image) {
        seriesData.mainImage = searchResults[showIdx].show.image.original;
    }
    else {
        seriesData.mainImage = 'https://ih0.redbubble.net/image.186051399.9597/raf,750x1000,075,t,fafafa:ca443f4786.jpg';
    }

    if (DEBUG) console.log(seriesData.mainImage);
    seriesData.seriesSummary = searchResults[showIdx].show.summary;
    if (DEBUG) console.log(`Summary: ${seriesData.seriesSummary}`);

    seriesData.status = searchResults[showIdx].show.status;
    if (DEBUG) console.log(`Status: ${seriesData.status}`);

    // If series is ended then no current air date/time
    if ( status !== 'Ended' ) {
        const day = searchResults[showIdx].show.schedule.days[0];
        const time = searchResults[showIdx].show.schedule.time;
        seriesData.schedule = `${day} ${time}`;
    }
    if (DEBUG) console.log(`Schedule: ${seriesData.schedule}`);
    seriesData.premiered = searchResults[showIdx].show.premiered;
    if (DEBUG) console.log(`Premier Date: ${seriesData.premiered}`);
    const network = searchResults[showIdx].show.network;
    if (network) {
        seriesData.network = searchResults[showIdx].show.network.name ? searchResults[showIdx].show.network.name : '';
    }
    if (DEBUG) console.log(`Network: ${seriesData.network}`);

    setBackgroundImg(seriesData.mainImage);
    setupModal(seriesData);
};

const setBackgroundImg = function(imgURL) {
    if (DEBUG) console.log('INSIDE setBackgroundImg');
    $('body > img').remove();
    const $img = $('<img>');
    $img.addClass('back-img');
    $img.attr('src', imgURL);
    $('body').append($img);
    return true;
};

const buildEpisodeModal = function (event) {
    if (DEBUG) console.log('INSIDE buildEpisodeModal');
    // Remove old data from modal
    $('.summary-text').remove();
    $('.summary-list').remove();
    $('.summary-p').remove();

    // Check if episode is 2 digits or just 1
    let episodeNum = $(event.currentTarget).attr('id').slice(-2);
    if ( isNaN(episodeNum) ) {
        episodeNum = $(event.currentTarget).attr('id').substr(-1);
    }
    if (DEBUG) console.log(`episodeNum = ${episodeNum}`);
    const episodeName = allEpisodesForSeason[`episode${episodeNum}`]['episodeName'];
    const season = allEpisodesForSeason[`episode${episodeNum}`]['seasonNumber'];
    const episodeDate = allEpisodesForSeason[`episode${episodeNum}`]['airDate'];
    const runtime = allEpisodesForSeason[`episode${episodeNum}`]['runtime'];
    let episodeSum = allEpisodesForSeason[`episode${episodeNum}`]['episodeSum'];
    if ( ! episodeSum ) {
        episodeSum = 'Episode Summary: N/A';
    }
    const episodeImg = allEpisodesForSeason[`episode${episodeNum}`]['episodeImg'];
    const network = allSeasons[`season${season}`].network.name;

    // Update global
    seasonNumber = season;

    const summary = episodeSum.replace(/<\/?[^>]+(>|$)/g, "");
    const $pSummary = $('<p>').addClass('summary-text').addClass('summary-p').text(summary);
    $pSummary.insertAfter('#show-episode-title');
    if (DEBUG) console.log(`Episode Name: ${episodeName}`);
    $('#show-episode-title').text(episodeName);

    const $ul = $('<ul>').addClass('summary-text').addClass('summary-list');

    let $li = $('<li><span class="heading">Season: </span>' + season + '</li>');
    $($ul).append($li);
    $li = $('<li><span class="heading">Episode: </span>' + episodeNum + '</li>');
    $($ul).append($li);
    $li = $('<li><span class="heading">Runtime: </span>' + runtime + ' minutes</li>');
    $($ul).append($li);
    $li = $('<li><span class="heading">Air Date: </span>' + episodeDate + '</li>');
    $($ul).append($li);
    $li = $('<li><span class="heading">Network: </span>' + network + '</li>');
    $($ul).append($li);
    // Append UL after summary paragraph
    $('.summary-p').append($ul);
    $('li').css('list-style-type', 'none');

    $modal = $('#episode-modal');
    setTimeout(openModal, 0);
};
$('.close').on('click', closeEpisodeModal);

const makeEpisodeOptions = function() {
    if (DEBUG) console.log('INSIDE makeEpisodeOptions');
    // remove old option container to display new episode results
    $('.episode-options').remove();
    $('#episode-container').remove();
    $('label').remove();

    const $label = $('<label>');
    if ( noEpisodes ) {
        $label.attr('id', 'season-label')
              .attr('for', 'show-container')
              .text('No Info Available');
        episodes = [];
    }
    else {
        $label.attr('id', 'season-label')
              .attr('for', 'show-container')
              .text(`Season ${seasonNumber}`);
    }

    $('#episode-options').append($label);

    if ( noEpisodes ) {
        // reset flag
        noEpisodes = false;
        return false;
    }

    const $select = $('<select>').attr('id', 'episode-container').attr('size', 4);
    $('#episode-options').append($select);

    episodes.forEach(function(episode, i) {
        const episodeText = allEpisodesForSeason[`${episode}`]['episodeName'];
        const $episodeOpt = $('<option>').addClass('episode-options').attr('data-description', `episode${i + 1}`).attr('value', `episode${i + 1}`).attr('id', `episode${i + 1}`).text(`Episode ${i + 1} - ${episodeText}`);
        $select.append($episodeOpt);
    });
    // Setup listener for when an episode button is clicked
    $('.episode-options').on('click', buildEpisodeModal);
}

const getSeasonInfo = function(event) {
    if (DEBUG) console.log('INSIDE getSeasonInfo');
    if (DEBUG) console.log(`Getting info for Season: ${seasonNumber}`);
    const queryPath = `seasons/${seasonID}/episodes`;
    const promise = $.ajax({
        url:api + queryPath
    });

    promise.then(
        // Success Callback function
        function(seasonArr) {
            if (DEBUG) console.log('running callback function for getSeasonInfo');
            episodes = [];

            seasonArr.forEach(function(episode, i) {
                const episodeNum = i + 1;
                episodes.push(`episode${episodeNum}`);
                allEpisodesForSeason[`episode${episodeNum}`] = {};
                allEpisodesForSeason[`episode${episodeNum}`]['episodeName'] = episode.name;
                allEpisodesForSeason[`episode${episodeNum}`]['seasonNumber'] = episode.season;
                allEpisodesForSeason[`episode${episodeNum}`]['episodeNumber'] = episode.number;
                allEpisodesForSeason[`episode${episodeNum}`]['airDate'] = episode.airdate;
                allEpisodesForSeason[`episode${episodeNum}`]['runtime'] = episode.runtime;
                if (episode.image) {
                    allEpisodesForSeason[`episode${episodeNum}`]['episodeImg'] = episode.image.medium;
                }
                allEpisodesForSeason[`episode${episodeNum}`]['episodeSum'] = episode.summary;
            });
            if (DEBUG) console.log(episodes);

            makeEpisodeOptions();
        },
        // Failure Callback function
        function() {
            console.log('bad request');
        }
    );
};

const pickShow = function(arrayOfShows) {
    if (DEBUG) console.log('INSIDE pickShow');
    const listOfShows = [];

    const $select = $('<select>')
        .attr('name', 'show-container')
        .attr('size', 4)
        .attr('id', 'show-container');

    const $label = $('<label>')
        .attr('for', 'show-container')
        .attr('id', 'series-label')
        .text('Search Results: (Select One)');

    $('fieldset').append($label);
    $('fieldset').append($select);

    arrayOfShows.forEach(function(series, i) {
        seriesIdString = '' + series.show.id;
        allShows[series.show.name] = seriesIdString;
        allShows[seriesIdString] = i;
        listOfShows.push(series.show.name);
        if (DEBUG2) console.log(`Adding series number: ${allShows[series.show.name]}`);

        const $showOpt = $('<option>')
            .addClass('series-options')
            .attr('value', seriesIdString)
            .text(series.show.name);

        $select.append($showOpt);
    });
    // Show list of fuzzy search results of user's input text
    if (DEBUG2) console.log(Object.keys(allShows));
    //////////////////////////////////////////////
    //// JQueryUI selectmenu DOES NOT WORK! /////
    // $('select#show-container').selectmenu({
    //     style:'popup',
    //     width: 300,
    // });
    //////////////////////////////////////////////

    // Setup listener for when an episode button is clicked
    $('.series-options').on('click', getSeriesInfo);
//    $('.series-options').change(getSeriesInfo);
}

const noResults = function() {
    const $div = $('<div>').attr('id', 'dialog');
    const $p1 = $('<p>').attr('id', 'line-1').text('No matches found');
    const $p2 = $('<p>').text('Please try again');

    $div.append($p1);
    $div.append($p2);
    $('main').append($div);

    // initialize the JQueryUI dialog using some common options
    $('#dialog').dialog({
        autoOpen  : false,
        modal     : true,
        show      : 'blind',
        hide      : 'blind',
        closeText : 'Try again'
    });

    // add the onclick handler
    $('#dialog').dialog('open');
    return false;
};

//////////////////////////////
// Execution order:
//      main code block
//      pickShow or noResults
//      getSeriesInfo
//      setBackgroundImg
//      setupModal
//      buildModalData
//      openModal
//      closeModal
//      getAllSeasons
//      makeSeasonBtns
//      onSeasonClick
//      getSeasonInfo
//      makeEpisodeOptions
//      buildEpisodeModal
//////////////////////////////

//////////
// main //
//////////

if (DEBUG) console.log('In main block WAITING for SEARCH click');

$('form').on('submit', function(event) {
    $(event.currentTarget).effect('bounce', 'fast');

    $('body > img').remove();
    $('.season-btns').remove();
    $('.episode-options').remove();
    $('#episode-container').remove();

    $('.season-btns').tooltip();
    $('#searchBtn').tooltip();

    // Remove select option menu
    $('#show-container').remove();
    $('.series-options').remove();
    $('label').remove();

    seasons = [];
    allSeasons = {};

    event.preventDefault();
    // Select input item with attribute "type" = "text" in HTML
    let showName = $('input[type="text"]').val();
    //showName = titleCase(showName);
    if (DEBUG) console.log(showName);
    if (DEBUG) console.log(api + showSearch + showName);
    // Latest AJAX method
    const promise = $.ajax({
        url:api + showSearch + showName
    });

    promise.then(
        // Success Callback function
        function(tvDataArr) {
            if (DEBUG) console.log('INSIDE initial PROMISE function');
            searchResults = tvDataArr;
            if (DEBUG) console.log(searchResults.length);
            // Object of collected series info unless no data was returned
            if ( searchResults.length ) {
                pickShow(searchResults);
            }
            else {
                noResults();
            }

            // How to get back here???
            // const seriesData = getSeriesInfo(tvDataArr[idx]);
            // setBackgroundImg(seriesData.mainImage);
            // setupModal(seriesData);
        },
        // Failure Callback function
        function() {
            console.log('bad request');
        }
    );
});




// JUNK //

//////////////////////////////////////
// $("#episode-container").ddslick({
//     onSelected: onEpisodeClick
// });
//////////////////////////////////////

// onSelected: function(selectedData){
//     //callback function: do something with selectedData;
// }


// const makeEpisodeBtns = function() {
//     if (DEBUG) console.log('INSIDE makeEpisodeBtns');
//     // remove old buttons to display new query results
//     $('.episode-btns').remove();
//
//     episodes.forEach(function(episode, i) {
//         // allSeasons[episode] = `Episode ${i}`;
//         const episodeText = allEpisodesForSeason[`${episode}`]['episodeName'];
//         const $episodeBtn = $('<input>').addClass('episode-btns').attr('type', 'button').attr('id', `episode${i + 1}`).attr('value', `Episode ${i + 1} - ${episodeText}`);
//         $('#episode-btns').append($episodeBtn);
//     });
//     // Setup listener for when a season button is clicked
//     $('.episode-btns').on('click', onEpisodeClick);
// }

// const titleCase = function(string) {
//     return string.replace(/(?:^|\s)\w/g, function(letter) {
//         return letter.toUpperCase();
//     });
// }

// const findShowIdx = function(tvDataArr, showName) {
//     for ( i = 0; i < tvDataArr.length; i++ ) {
//         if (DEBUG) console.log(tvDataArr[i].show.name);
//         if ( tvDataArr[i].show.name === showName ) {
//             if (DEBUG) console.log(`Found ${showName}`);
//                 return i;
//         }
//         else {
//             if (DEBUG) console.log(`No match for ${showName}`);
//         }
//     }
// }
