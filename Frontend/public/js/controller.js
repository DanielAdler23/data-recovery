
var data  = angular.module('data', []);
var wordPlace={};
var files={};
var regex = /[\n,"_!-?:.\r\n ]+/g

data.controller('getFiles', ['$scope',

    function($scope){
        $scope.allFiles = function() {
            $('#allFiles').empty();
            $.ajax({
                type: "GET",
                url: "http://localhost:3000/getFiles",
                cache: false,
                success: function(data){
                    console.log(data.Result)
                    for(var i=0; i<Object.keys(data.Result).length;i++ ){
                        $('#allFiles').append(
                            '<h2>'+ "title: " + data.Result[i].title+'</h2>'+
                            '<h3>'+ "body: "+data.Result[i].body+'</h3>'+
                            '<br><br>')
                    }
                }
            })
        }
    }
])

data.controller('controller',['$scope',
    function($scope){
        $scope.LoadFile = function() {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/loadFiles",
                success: function(){
                    console.log("files loaded to files collection")
                }
            })
        }

        $scope.Loadwords = function() {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/loadWords",
                success: function(){
                    console.log("files loaded to words collection")
                }
            })
        }
    }
])

var mark = []
data.controller('search',['$scope',
    function($scope){
        $scope.submit = function (search) {
             $('#results').empty();
             console.log(search);
             $.ajax({
                 type: "GET",
                 url: "http://localhost:3000/getWord/"+search,
                 async: false,
                 success: function(data) {
                    wordPlace = data;
                     console.log(wordPlace)
                 }
             });
             showSearch(wordPlace.result.files,wordPlace.result.words)
        }
     }

])

function showSearch (files,words){
    for(var file of files) {
        $('#results').append('<a href="#" id="searchResults"  >'+
            '<h2>'+ file.title+ '</h2>'+'</a>').click(function (){blat(file._id,file,words)})
        var body  = file.body.split(/\r?\n/);
        for (var j=0;j<3;j++){
            $('#results').append('<p>'+body[j] +'</p>')
        }
    }

    // for(var i=0; i<files.Result.length;i++){
    //     if(files.Result[i]._id == wordPlase.Result.files[i].fileId ){
    //         //print 3 lines of the story
    //         $('#results').append('<a href="#" id="searchResults" ng-click="openFile()" >'+
    //             '<h2>'+ files.Result[i].title+ '</h2>'+'</a>')
    //
    //         console.log(files.Result[i].title)
    //
    //         var body  = files.Result[i].body.split(/\r?\n/);
    //         for (var j=0;j<3;j++){
    //             console.log(body[j])
    //             $('#results').append('<p>'+body[j] +'</p>')
    //         }
    //         $('#results').append('<br>')
    //         console.log("...")
    //     }
    // }
}

function blat(fileId,file,words) {
    for(var word of words){
        if(file.body.includes(word.word)){

            for(item of word.files){
                if(item.fileId ==fileId ) {
                    for (offof of item.places) {
                        mark.push(offof.offset)
                    }
                }
            }
        }
    }
    //mark.sort()
    console.log(mark)
    markFile(file)

}

function markFile(file){
    var bodyPars = file.body
    bodyPars=bodyPars.split(regex)
    console.log(bodyPars)
    var i = 0
    $('#results').hide()
    $('#markFile').append('<br>'+'<h2>'+ file.title +'</h2>')
        for(var j in bodyPars ) {
            if(!bodyPars[j].match(regex)) {
                if (j == mark[i]) {
                    $('#markFile').append('<span class="highlighted">' + " " + bodyPars[j] + '</span>')
                    if(i < mark.length - 1)
                        i++
                } else {
                    $('#markFile').append(" " + bodyPars[j])
                }
            } else {
                console.log(bodyPars[j])
                $('#markFile').append(" " + bodyPars[j])
            }
        }
}