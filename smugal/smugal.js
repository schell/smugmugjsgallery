/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *  smugal.js
 *  A javascript gallery for smug mug
 *  Copyright (c) 2010 Schell Scivally Enterprise. All rights reserved.
 *
 *  @author Schell Scivally
 *  @since  Sun May 30 16:58:26 PDT 2010
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/
var testing = true;
var galleryModel = {};
var albumId = '11397881';
var albumKey = 'MYoeS';
var maxSizeOfDisplayedImage = 3;

//--------------------------------------
//  Page elements
//--------------------------------------
var mainDiv = new Element('div', {
    id : 'mainDiv',
    text : 'loading smug mug gallery...'
});

function transition (index) {
    if (! transition.started) {
        transition.started = true;
        
    } else {
        
    }
}

function downloadImages () {
    var n = galleryModel.images.length;
    for (var i = 0; i < n; i++) {
        var image = new Image();
        image.src = galleryModel.images[i].urls[maxSizeOfDisplayedImage];
        image.onload = function (index, img) {
            return function () {
                var imageModel = galleryModel.images[index];
                imageModel.image = img;
                imageModel.element = new Element('img');
                imageModel.element.inject(mainDiv);
                //mainDiv.setProperty('html', mainDiv.getProperty('html') + '<br />' + imageModel.image.src);
                imageModel.tween = new Fx.Tween(imageModel.element, {
                    property : 'opacity',
                    duration : 1000
                });
                galleryModel.images[index].model = imageModel;
            }
        }(i, image);
    }
}

function display () {
    mainDiv.inject(document.body);
    downloadImages();
}

function setup (atomFeed) {
    var mediaGroupsMatch = atomFeed.match(/<media:group>/g);
    var urlRegex = /<media:content[^>]*url="([^"]*)"/g;
    
    numImages = mediaGroupsMatch.length;
    var imageName = '';
    galleryModel.images = [];
    while(match = urlRegex.exec(atomFeed)) {
        var filenameSlash = match[1].lastIndexOf('/');
        var newImageName = match[1].substring(0, filenameSlash);
        if (newImageName != imageName) {
            galleryModel.images.push({
                name : newImageName,
                urls : []
            });
            imageName = newImageName;
        }
        var currentImage = galleryModel.images[galleryModel.images.length - 1];
        currentImage.urls.push(match[1]);
    }
    
    display();
}

window.addEvent('domready', function (e) {
    var feedReq = new Request({
        method : 'get',
        url : 'http://smugmuggallery.local/feed.mg',
        onSuccess : function (text, xml) {
            setup(text);
        }, 
        onFailure : function (xhr) {
            alert('failed:\n'+xhr);
        }
    });
    var vars = testing ? '' : 'Type=gallery&Data='+albumId+'_'+albumKey;
    feedReq.send(vars);
});