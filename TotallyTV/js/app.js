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

const buildModalData = function(seriesInfo) {
    if (DEBUG) console.log('INSIDE buildModalData');
    const $ul = $('<ul>').addClass('summary-text').addClass('summary-list');
    //$ul.addClass('summary-text');
    // status, scheduled, premiered, network
    // let $li = $('<li>').text(`Status: ${seriesInfo.status}`);
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
        const network = allSeasons[eleID].network;
        if (DEBUG) console.log(`Season started ${seasonStartDate} and ended ${seasonEndDate}`);


        // seasonImages[`season${numOfSeasons}`] = season.image.medium;
        // const $img = $('<img>').addClass('season-pics').attr('src', season.image.medium);
        // $('#season-pics').append($img);
        const $seasonBtn = $('<input>')
            .addClass('season-btns')
            .attr('type', 'button')
            .attr('id', `season${numOfSeasons}`)
            .attr('value', `Season ${numOfSeasons}`)
            .attr('title', `Season ${numOfSeasons} of ${seriesData.name} ran from ${seasonStartDate} thru ${seasonEndDate} on ${seriesData.network}`);

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
//const $modal = $('#modal');

const closeModal = () => {
    if (DEBUG) console.log('INSIDE closeModal');
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
    setTimeout(openModal, 2000);
};
$('#close').on('click', closeModal);

const getSeriesInfo = function(tvDataArr) {
    if (DEBUG) console.log('INSIDE getSeriesInfo');
    if (DEBUG) console.log(tvDataArr);
    // Object to hold gleaned data from TVMaze
    seriesData = {};
    // Find title match to data entered
    // const showIdx = findShowIdx(tvDataArr, showName);
    const showIdx = 0;
    seriesID = seriesData.id = tvDataArr[showIdx].show.id;
    if (DEBUG) console.log(`Series ID: ${seriesData.id}`);
    seriesData.name = tvDataArr[showIdx].show.name;
    if (DEBUG) console.log(`Series Name: ${seriesData.name}`);
    if (DEBUG) console.log(tvDataArr[showIdx]);
    seriesData.mainImage = tvDataArr[showIdx].show.image.original;
    if (DEBUG) console.log(seriesData.mainImage);
    seriesData.seriesSummary = tvDataArr[showIdx].show.summary;
    if (DEBUG) console.log(`Summary: ${seriesData.seriesSummary}`);

    seriesData.status = tvDataArr[showIdx].show.status;
    if (DEBUG) console.log(`Status: ${seriesData.status}`);

    // If series is ended then no current air date/time
    if ( status !== 'Ended' ) {
        const day = tvDataArr[showIdx].show.schedule.days[0];
        const time = tvDataArr[showIdx].show.schedule.time;
        seriesData.schedule = `${day} ${time}`;
    }
    if (DEBUG) console.log(`Schedule: ${seriesData.schedule}`);
    seriesData.premiered = tvDataArr[showIdx].show.premiered;
    if (DEBUG) console.log(`Premier Date: ${seriesData.premiered}`);
    const network = tvDataArr[showIdx].show.network;
    if (network) {
        seriesData.network = tvDataArr[showIdx].show.network.name ? tvDataArr[showIdx].show.network.name : '';
    }
    if (DEBUG) console.log(`Network: ${seriesData.network}`);
    return seriesData;
};

const setBackgroundImg = function(imgURL) {
    if (DEBUG) console.log('INSIDE setBackgroundImg');
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

    let episodeNum = $(event.currentTarget).attr('id').slice(-2);
    if ( isNaN(episodeNum) ) {
        episodeNum = $(event.currentTarget).attr('id').substr(-1);
    }
    if (DEBUG) console.log(`episodeNum = ${episodeNum}`);
    const episodeName = allEpisodesForSeason[`episode${episodeNum}`]['episodeName'];
    const season = allEpisodesForSeason[`episode${episodeNum}`]['seasonNumber'];
    const episodeDate = allEpisodesForSeason[`episode${episodeNum}`]['airDate'];
    const runtime = allEpisodesForSeason[`episode${episodeNum}`]['runtime'];
    const episodeSum = allEpisodesForSeason[`episode${episodeNum}`]['episodeSum'];
    const episodeImg = allEpisodesForSeason[`episode${episodeNum}`]['episodeImg'];

    // const seasonStartDate = allSeasons[`season${season}`].premiereDate;
    // const seasonEndDate = allSeasons[`season${season}`].endDate;
    seasonNumber = allSeasons[`season${season}`].number;

    const summary = episodeSum.replace(/<\/?[^>]+(>|$)/g, "");
    const $pSummary = $('<p>').addClass('summary-text').addClass('summary-p').text(summary);
    $pSummary.insertAfter('#show-episode-title');
    if (DEBUG) console.log(`Episode Name: ${episodeName}`);
    $('#show-episode-title').text(episodeName);

    const $ul = $('<ul>').addClass('summary-text').addClass('summary-list');

    let $li = $('<li><span class="heading">Title: </span>' + episodeName + '</li>');
    $($ul).append($li);
    //if (DEBUG) console.log(`schedule string: "${seriesInfo.schedule}"`);
    //seriesInfo.schedule = seriesInfo.schedule == 'undefined ' ? 'N/A' : seriesInfo.schedule;
    // $li = $('<li>').text(`Schedule: ${seriesInfo.schedule}`);
    $li = $('<li><span class="heading">Schedule: </span>' + '?' + '</li>');
    $($ul).append($li);
    // $li = $('<li>').text(`Premiered: ${seriesInfo.premiered}`);
    $li = $('<li><span class="heading">Air Date: </span>' + episodeDate + '</li>');
    $($ul).append($li);
    // $li = $('<li>').text(`Network: ${seriesInfo.network}`);
    $li = $('<li><span class="heading">Network: </span>' + '?' + '</li>');
    $($ul).append($li);
    // Append UL after summary paragraph
    $('.summary-p').append($ul);
    $('li').css('list-style-type', 'none');

    $modal = $('#episode-modal');
    setTimeout(openModal, 0);
};
$('#close2').on('click', closeModal);

const makeEpisodeOptions = function() {
    if (DEBUG) console.log('INSIDE makeEpisodeOptions');
    // remove old option container to display new episode results
    $('.episode-options').remove();
    $('#episode-container').remove();

    const $select = $('<select>').attr('id', 'episode-container').attr('size', 8);
    $('#episode-options').append($select);

    episodes.forEach(function(episode, i) {
        const episodeText = allEpisodesForSeason[`${episode}`]['episodeName'];
        const $episodeOpt = $('<option>').addClass('episode-options').attr('data-description', `episode${i + 1}`).attr('value', `episode${i + 1}`).attr('id', `episode${i + 1}`).text(`Episode ${i + 1} - ${episodeText}`);
        $select.append($episodeOpt);
    });
    // Setup listener for when an episode button is clicked
    $('.episode-options').on('click', buildEpisodeModal);
}

const getSeasonInfo = function() {
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

            // Log episode 2 name for testing purposes
            const e2Name = allEpisodesForSeason['episode2']['episodeSum'];
            if (DEBUG) console.log(`Season ${seasonNumber} Episode 2 of ${seriesData.name}: ${e2Name}`);

            makeEpisodeOptions();

            // $('#runtime').html(data.Runtime);
            // $('#imdb-rating').html(data.imdbRating);
        },
        // Failure Callback function
        function() {
            console.log('bad request');
        }
    );
};

const onSeasonClick = function(event) {
    if (DEBUG) console.log('INSIDE onSeasonClick');
    const eleID = $(event.currentTarget).attr('id');
    seasonID = allSeasons[eleID].id;
    const seasonStartDate = allSeasons[eleID].premiereDate;
    const seasonEndDate = allSeasons[eleID].endDate;
    seasonNumber = allSeasons[eleID].number;
    getSeasonInfo();
};

//////////////////////////////
// Execution order:
//      main code block
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
// $(event.target).effect('bounce', 'fast');

$('form').on('submit', function(event) {
    // Reject empty input text
    // if ( $('input[type="text"]').val() === null || $('input[type="text"]').val().match(/^ *$/) !== null ) {
        // $('#input-box').val("");
        // $(event.currentTarget).effect('bounce', 'fast');
        // totallyTV();
    // }
    // else {
    //     jQuery.fx.off = true;
    // }

    $('body > img').remove();
    $('.season-btns').remove();
    $('.episode-options').remove();
    $('#episode-container').remove();

    $('.season-btns').tooltip();
    $('#searchBtn').tooltip();

    seasons = [];
    allSeasons = {};

    event.preventDefault();
    // Select all input items with attribute "type" = "text" in HTML
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
            // Object of collected series info
            const seriesData = getSeriesInfo(tvDataArr);
            setBackgroundImg(seriesData.mainImage);
            setupModal(seriesData);
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
