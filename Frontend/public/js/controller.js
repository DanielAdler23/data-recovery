

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
            console.log(response)
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

function searchWords() {
    $('#allWords').empty()
    $(document).bind('keypress', e => {
        if(e.keyCode==13){
            $('.searchWordValue').trigger('click')
        }
    })
    var searchExpression = $('.searchWordValue').val()
    searchExpression.replace(/ +?/g, '')
    if(!searchExpression || searchExpression.trim().length == 0)
        return null
    else {
        $.ajax({
            url: "http://localhost:3000/searchWords/" + searchExpression,
            type: "GET",
            success: response => {
                console.log(response)
            },
            error: error => {
                console.log(error)
            }
        })
    }
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
