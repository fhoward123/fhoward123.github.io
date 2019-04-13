const DEBUG = true;
const showSearch = 'search/shows?q=';
const api = 'http://api.tvmaze.com/';

const displayModal = function(seriesInfo) {
    $('.summary-text').remove();
    const $modal = $('#modal');
    // Strip out the HTML embedded in the summaries
    const summary = seriesInfo.seriesSummary.replace(/<\/?[^>]+(>|$)/g, "");
    const $pSummary = $('<p>').addClass('summary-text').text(summary);
    $pSummary.insertAfter('#show-title');
    if (DEBUG) console.log(`Series Name: ${seriesInfo.name}`);
    $('#show-title').text(seriesInfo.name);

    const closeModal = () => {
        $modal.css('display', 'none');
    }
    const openModal = () => {
        $modal.css('display', 'block');
    };
    setTimeout(openModal, 2000);
    $('#close').on('click', closeModal);
}

const getSeriesInfo = function(tvDataArr) {
    if (DEBUG) console.log(tvDataArr);
    // Object to hold gleaned data from TVMaze
    const seriesData = {};
    // Find title match to data entered
    // const showIdx = findShowIdx(tvDataArr, showName);
    const showIdx = 0;
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
}

const setBackgroundImg = function(imgURL) {
    // $('body > ').css('background', `url(${mainImage}) no-repeat center center fixed`);
    // $('body::after').css('background', `url(${mainImage}) no-repeat center center fixed`);
    // $('body').css('background', 'url(' + mainImage + ') no-repeat center center fixed');

    const $img = $('<img>');
    $img.attr('src', imgURL);
    $('body').append($img);
    // $($img).css('background', mainImage);
    return true;
}
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
$('form').on('submit', function(event) {
    $('body > img').remove();
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
            // Object of collected series info
            const seriesData = getSeriesInfo(tvDataArr);
            setBackgroundImg(seriesData.mainImage);
            displayModal(seriesData);
            // $('#runtime').html(data.Runtime);
            // $('#imdb-rating').html(data.imdbRating);
        },
        // Failure Callback function
        function() {
            console.log('bad request');
        }
    );
});
