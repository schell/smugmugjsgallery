/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *  smugal.js
 *  A javascript gallery for smug mug
 *  Copyright (c) 2010 Schell Scivally Enterprise. All rights reserved.
 *
 *  @author Schell Scivally
 *  @since  Sun May 30 16:58:26 PDT 2010
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/

var smugal = function (options) {
    // options
    var testing = options.testing || false;
    var albumUrl = options.albumUrl || '';
    var albumId = options.albumId || '11397881';
    var albumKey = options.albumKey || 'MYoeS';
    var maxSizeOfDisplayedImage = options.maxSizeOfDisplayedImage || 3;
    var viewDuration = options.viewDuration || 2000;
    var fadeDuration = options.fadeDuration || 1000;
    // non options
    
    var galleryModel = {};
    var tweens = [];
    var imgStatus = {};
    //--------------------------------------
    //  Page elements
    //--------------------------------------
    var loadingDiv = new Element('div', {
        id : 'loadingDiv',
        text : 'loading smug mug gallery...'
    });

    var mainDiv = new Element('div', {
        id : 'mainDiv'
    });
    //--------------------------------------
    //  Functions
    //--------------------------------------
    function log (msg) {
        if (window.console) {
            console.log(msg);
        }
    }
    function transition () {
        var imgs = mainDiv.getElements('img');
        var out = transition.ndx;
        var inn = transition.ndx == tweens.length - 1 ? 0 : transition.ndx + 1;
        var imgOut = $('img_' + out);
        var inId = 'img_' + inn;
        var imgIn = $(inId);
    
        transition.ndx = inn;
        if (! transition.started) {
            transition.started = true;
            imgIn.setStyle('display', 'inline');
            imgIn.position();
            tweens[inn].start('opacity', 0, 1).chain(function () {
                setTimeout(transition, viewDuration);
            });
        } else {
            if (imgStatus[inId] === 'loading') {
                imgStatus[inId] = 'waiting';
                return;
            }
            tweens[out].start('opacity', 1, 0).chain(function () {
                imgOut.setStyle('display', 'none');
            });
            imgIn.position();
            imgIn.setStyle('display', 'inline');
            tweens[inn].start('opacity', 0, 1).chain(function () {
                setTimeout(transition, viewDuration);
            });
        }
    }
    transition.started = false;
    transition.ndx = -1;

    function downloadImages () {
        var n = galleryModel.images.length;
    
        var anotherImageLoaded = function (thatId) {
            var id = this.id || thatId;
            log(id);
            var status = imgStatus[id];
            imgStatus[id] = 'complete';
            if (status === 'waiting') {
                transition();
            }
        };

        var firstImageLoaded = function () {
            anotherImageLoaded(this.id);
            loadingDiv.dispose();
            transition();
        };
    
        for (var i = 0; i < n; i++) {
            var id = 'img_' + i;
            imgStatus[id] = 'loading';
            var maxSize = galleryModel.images[i].urls.length - 1;
            var size = maxSize >= maxSizeOfDisplayedImage ? maxSizeOfDisplayedImage : maxSize;
            log(size);
            var src = galleryModel.images[i].urls[size];
            var img = new Element('img', {
                src : src, 
                id : id,
                styles : {
                    border : '#000000 solid 1px',
                    display : 'none'
                },
                events : {
                    load : (i == 0 ? firstImageLoaded : anotherImageLoaded)
                }
            });
            var tween = new Fx.Tween(img, {
                duration : fadeDuration
            });
            tween.set('opacity', 0);
            tweens.push(tween);
            img.inject(mainDiv);
        }
    }

    function display () {
        loadingDiv.inject(mainDiv);
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
            url : albumUrl,
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
}