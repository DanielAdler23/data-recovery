
function loadNewFiles() {
    $.ajax({
        url: "http://localhost:3000/loadNewFiles",
        type: "POST",
        success: response => {
            if(response.status == 200) {
                $('.loadNewFiles').css({'background-color' : '#3c763d'});
                setTimeout(() => {
                    $('.loadNewFiles').css({'background-color' : ''});
                }, 1000)
            }
        }
    })
}


function loadNewWords() {
    $.ajax({
        url: "http://localhost:3000/loadNewWords",
        type: "POST",
        success: response => {
            if(response.status == 200) {
                $('.loadNewWords').css({'background-color' : '#3c763d'});
                setTimeout(() => {
                    $('.loadNewWords').css({'background-color' : ''});
                }, 1000)
            }
        }
    })
}

function getAllFilesAdmin() {
    $('#allFiles').empty()
    $.ajax({
        url: "http://localhost:3000/getAllFilesAdmin",
        type: "GET",
        success: response => {
            console.log(response)
            for(var item of response.message) {
                var parsed = 'notParsed'
                var active = 'Deactive'
                if(item.parsed) parsed = 'parsed'
                if(item.active) active = 'Active'
                $('#allFiles').append(
                    '<h2 class="fileTitle">' + item.title + '</h2>' +
                    `<button class="fileActiveButton" id=${active} value=${item._id} onclick="toggleFileActive(this.value)">${active}</button>` +
                    '<h5 class=' + parsed + '></h5>' +
                    '<p>' + item.body + '</p>' +
                    '<br><br>')
            }
        }
    })
}



function getAllFiles() {
    $('#allFiles').empty()
    $.ajax({
        url: "http://localhost:3000/getAllFiles",
        type: "GET",
        success: response => {
            for(var item of response.message) {
                var parsed = 'notParsed'
                if(item.parsed) parsed = 'parsed'
                $('#allFiles').append(
                    '<h2>' + item.title + '</h2>' +
                    '<h5 class=' + parsed + '></h5>' +
                    '<p>' + item.body + '</p>' +
                    '<br><br>')
            }
        }
    })
}

$('.fileSearchBar').submit(function () {
    searchFiles()
    return false
})

$('.searchFileValue').keypress(function(e){
    if (e.which == 13){
        searchFiles()
        return false
    }
})

$('.getAllFiles').click(function() {
    getAllFiles()
})


function searchFiles() {
    $('#allFiles').empty()
    var searchValue = $('.searchFileValue').val()
    if(!searchValue) return
    $.ajax({
        url: "http://localhost:3000/searchFiles/" + searchValue,
        type: "GET",
        success: response => {
            for(var item of response.message) {
                var parsed = 'notParsed'
                if(item.parsed) parsed = 'parsed'
                $('#allFiles').append(
                    '<h2>' + item.title + '</h2>' +
                    '<h5 class=' + parsed + '></h5>' +
                    '<p>' + item.body + '</p>' +
                    '<br><br>')
            }
        }
    })
}

$('.wordSearchBar').submit(function () {
    searchWords()
    return false
})


$('.searchWordValue').keypress(function(e){
    if (e.which == 13){
        searchWords()
        return false
    }
})


function searchWords() {

    $('#allWords').empty()
    var searchExpression = $('.searchWordValue').val()
    searchExpression.replace(/ +?/g, '')
    if(!searchExpression || searchExpression.trim().length == 0)
        return null
    else {
        $.ajax({
            url: "http://localhost:3000/searchWords/" + searchExpression,
            type: "GET",
            success: response => {
                for(var item of response.message) {
                    $('#allWords').append(
                        `<div class="${item._id}">` +
                        '<h2 class="fileTitle">' + item.title + '</h2>' +
                        `<button class="showEntireFile hideFile" id="${item._id}" value="${item.words}" onclick="getFileObject(this,this.id,this.value)">Show File</button>` +
                        '<p></p>' +
                        '</div>' +
                        '<hr>' +
                        '<br>')
                }
            },
            error: error => {
                console.log(error)
            }
        })
    }
    document.getElementById('post').value ="";
}



function passwordPrompt() {
    var testV = 1;
    var pass1 = prompt('Please Enter Your Password',' ');
    while (testV < 3) {
        if (!pass1)
            break
        if (pass1.toLowerCase() == "admin") {
            window.open('http://localhost:8000/admin.html', "_self");
            break;
        }
        testV+=1;
    }

    return " ";
}


function toggleFileActive(fileId) {
    $.ajax({
        url: "http://localhost:3000/toggleFile/" + fileId,
        type: "GET",
        success: response => {
            console.log(response)
            getAllFilesAdmin()
        }
    })
}



$('.SeeMore2').click(function(){
    var $this = $(this);
    $this.toggleClass('SeeMore2');
    if($this.hasClass('SeeMore2')){
        $this.text('See More');
    } else {
        $this.text('See Less');
    }
});


function getFileObject(button, fileId, words) {

    $(`#${button.id}`).toggleClass('hideFile')
    if($(`#${button.id}`).hasClass('hideFile')) {
        $(`#${button.id}`).text('Show File')
        $(`.${fileId} > p`).empty()
        return
    } else {
        $(`#${button.id}`).text('Hide File')
        $(`.${fileId} > p`).empty()
        for (var word of words)
            word = word.toLowerCase()
        console.log(words)
        $.ajax({
            url: "http://localhost:3000/getFileObject/",
            type: "POST",
            data: {
                fileId,
                words
            },
            success: response => {
                console.log(response)
                markWords(fileId, response.message.fileBody, response.message.offsets)
            }
        })
    }
}

function markWords(divClass,body,offsets){

    body = body.replace(/'/g, "")
    body = body.replace(/[,"_!-?:.\r\n ]+/g, " ").trim().toLowerCase()

    var fileWords = body.split(' ')

    for(var index in fileWords ) {
        if (index==0)
            continue
            if (offsets.includes(index))
                $(`.${divClass} > p`).append('<span class="highlighted">' + " " + fileWords[index-1] + '</span>')
            else if(index == fileWords.length-1) {
                    console.log(index)
                    if (offsets.includes(index))
                        $(`.${divClass} > p`).append('<span class="highlighted">' + " " + fileWords[index] + '</span>')
                    else
                        $(`.${divClass} > p`).append(" " + fileWords[index])
            } else
                $(`.${divClass} > p`).append(" " + fileWords[index-1])
    }
}
