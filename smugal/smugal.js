/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *  smugal.js
 *  A javascript gallery for smug mug dot com
 *  Copyright (c) 2010 New Skin Media. All rights reserved.
 *  
 *  Imagine a fearsomely comprehensive disclaimer of liability. 
 *  Now fear, comprehensively.
 *
 *  @author Schell Scivally
 *  @since  Sun May 30 16:58:26 PDT 2010
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/
function smugal (options) {
    // options
    var apiUrl = 'http://api.smugmug.com/services/api/json/1.2.2/';
    var testing = options.testing || false;
    
    var targetId = options.targetId || false;
    var albumId = options.albumId || '11397881';
    var albumKey = options.albumKey || 'MYoeS';
    var size = options.size || 'Original';
    var viewDuration = options.viewDuration || 3000; // in milliseconds
    var fadeDuration = options.fadeDuration || 2000;
    
    // make sure we have a target div id, go and heyjacks
    if (!targetId || !go || !heyjacks) {
        return;
    }
    
    // non options
    var imageList;
    var imgs = [];
    var tweening = false;
    var sessionId = '';
    var target = $(targetId);
    
    /* size should be nothing or one of the following:
    X3Large
    X2Large
    XLarge
    Large
    Lightbox
    Medium
    Original
    Small
    Thumb
    Tiny
    */
    var sizes = [
        '',
        'X3Large',
        'X2Large',
        'XLarge',
        'Large',
        'Lightbox',
        'Medium',
        'Original',
        'Small',
        'Thumb',
        'Tiny'
    ];
    var n = sizes.length;
    var sizedCorrectly = false;
    for (var i = 0; i < n; i++) {
        if (sizes[i] == size) {
            sizedCorrectly = true;
            break;
        }
    }
    if (!sizedCorrectly) {
        size = 'Original';
    }

    //--------------------------------------
    //  Debugin
    //--------------------------------------
    function log (msg) {
        if (testing && typeof console != 'undefined') {
            console.log(msg);
        }
    }
    function error (msg) {
        if (testing && typeof console != 'undefined') {
            console.warn('ERROR ' + msg);
        }
    }
    //--------------------------------------
    //  Functions
    //--------------------------------------
    function imgAfter (i) {
        var oi = i;
        var n = imgs.length;
        if (i >= n - 1) {
            i = -1;
        }
        for (++i; i < n; i++) {
            if (imgs[i]) {
                return i;
            }
        }
        return oi;
    }
    
    function tweenIn (img) {
        log('tweenIn');
        if (!img.myTween) {
            img.myTween = new Fx.Tween(img, {
                duration : fadeDuration
            });
        }
        img.myTween.set('opacity', 0);
        img.myTween.set('display', 'block');
        img.inject(target);
        img.myTween.start('opacity', 0, 1);
        return img.myTween;
    }
    
    function tweenOut (img) {
        log('tweenOut');
        if (!img.myTween) {
            img.myTween = new Fx.Tween(img, {
                duration : fadeDuration
            });
        }
        
        img.myTween.start('opacity', 1, 0);
        return img.myTween;
    }
    
    function tween (ndx) {
        var n = imgAfter(ndx);
        log('tween ' + ndx + ' ' + n);
        if (!imgs[ndx].myTween) {
            tweenIn(imgs[ndx]).chain(function () {
                setTimeout(function () {
                    tween(n);
                }, viewDuration);
            });
        } else {
            tweenOut(imgs[ndx]).chain(function () {
                imgs[ndx].myTween.set('display', 'none');
                tweenIn(imgs[n]).chain(function () {
                    setTimeout(function () {
                        tween(n);
                    }, viewDuration);
                });
            });
        }
    }
    
    function getAlbumImages (callback) {
        log('retrieving album image list');
        heyjacks.call(apiUrl, 
            {
                method : 'smugmug.images.get',
                SessionID : sessionId,
                AlbumID : albumId,
                AlbumKey : albumKey
            },
            function (json) {
                if (json.stat == 'ok') {
                    log('got list');
                    imageList = json.Album.Images;
                } else {
                    error('Could not retrieve image list.')
                }
                callback();
            });
    }
    
    function login (callback) {
        log('logging in anonymously');
        heyjacks.call(apiUrl, 
            {
                method : 'smugmug.login.anonymously',
                APIKey : 'LcSPLixdbyrPIbnXb8JporyNZci3z11C'
            }, 
            function (json) {
                if (json.stat == 'ok') {
                    sessionId = json.Login.Session.id;
                    log('recieved session id: ' + sessionId);
                } else {
                    error('Could not retrieve session id');
                }
                callback();
            });
    }
    
    function start () {
        var seq = go(
            login,
            getAlbumImages,
            // get each image in parallel and populate
            // our gallery with downloaded images
            function (callback) {
                var n = imageList.length;
                var aseq = go.together();
                for (var i = 0; i < n; i++) {
                    imgs.push(false);
                    aseq.push(function (ndx) {
                        var image = imageList[ndx];
                        return function (next) {
                            heyjacks.call(apiUrl,
                            {
                                method : 'smugmug.images.getURLs',
                                SessionID : sessionId,
                                ImageID : image.id,
                                ImageKey : image.Key 
                            },
                            // once we have the image urls
                            function (json) {
                                if (json.stat == 'ok') {
                                    log('got urls for image ' + ndx);
                                    // download the image into an array of img tags
                                    var imgSize = size;
                                    if (!(size+'URL' in json.Image)) {
                                        imgSize = 'Original';
                                    }
                                    var img = new Element('img', {
                                        src : json.Image[imgSize+'URL'], 
                                        id : 'img_'+ndx,
                                        styles : {
                                            display : 'none'
                                        },
                                        events : {
                                            load : function () {
                                                imgs[ndx] = this;
                                                log('loaded img ' + ndx);
                                                if (!tweening) {
                                                    target.innerHTML = '';
                                                    tweening = true;
                                                    tween(ndx);
                                                }
                                                // callback to inc the aseq
                                                next();
                                            }
                                        }
                                    });
                                } else {
                                    error('Could not retrieve url for image ' + ndx);
                                }
                            });
                        }
                    }(i));
                }
                aseq.push(function () {
                    log('got all images');
                });
                aseq.start();
            }).start();
        
    }

    window.addEvent('domready', function (e) {
        go.error = error;
        start();
    });
}