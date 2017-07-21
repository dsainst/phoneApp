var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        //    document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        //  app.receivedEvent('deviceready');
        initMap();
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        //   var parentElement = document.getElementById(id);
        //   var listeningElement = parentElement.querySelector('.listening');
        //   var receivedElement = parentElement.querySelector('.received');

        //   listeningElement.setAttribute('style', 'display:none;');
        //   receivedElement.setAttribute('style', 'display:block;');

        //   console.log('Received Event: ' + id + ' ' + parentElement);
    }
};
var map;
var markers = [];
function initMap() {
    var uluru = {lat: 59.97, lng: 30.39};
    map = new google.maps.Map(document.getElementById('YMapsID'), {
        zoom: 8,
        center: new google.maps.LatLng(uluru),
        mapTypeId: 'terrain',
        maxZoom: 13
    });
}

function clearMarkers() {
    setMapOnAll(null);
}

function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Adds a marker to the map and push to the array.
function addMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markers.push(marker);
}

function getMap() {
    var fbURL = "http://api.zemli78.ru/web";
    $.ajax({
        url: fbURL,
        data: "",
        type: 'GET',
        success: function (resp) {
            console.log(resp);
            showOnMap(resp);
        },
        error: function (e) {
            console.log('Error: ' + e);
        }
    });

    getFilters();
}

function showOnMap(results) {
    var latLng, coords;

    var infowindow = new google.maps.InfoWindow();
    var marker, i;
    var iconBase = 'http://api.zemli78.ru/img/post-672578-1303213661.gif';

    var mapBounds = new google.maps.LatLngBounds();

    clearMarkers();

    for (i = 0; i < results.features.length; i++) {
        coords = results.features[i].geometry.coordinates;
        latLng = new google.maps.LatLng(coords[1], coords[0]);
        marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: {
                url: iconBase,
                scaledSize: new google.maps.Size(38, 38)
            }
        });

        mapBounds.extend(latLng);
        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                var prop = results.features[i].properties;
                infowindow.setContent("<a href='" + results.features[i].id +
                    "' class='loadObject' onClick='getObjById(" + results.features[i].id + ");return false;'>" + results.features[i].id + "</a>");
                infowindow.open(map, marker);
                $('#YMapsID').on('click', '.loadObject', function (e) {
                    e.preventDefault();
                    $('#footer').html($(this).next('.desc').html());
                    showInfo();
                });
            }
        })(marker, i));

        markers.push(marker);
    }
    map.fitBounds(mapBounds);
    if (results.features.length == 0) {
        latLng = new google.maps.LatLng(59.97, 30.39);
        mapBounds.extend(latLng);
        map.fitBounds(mapBounds);
        map.setZoom(8);
        setTimeout(function(){
            navigator.notification.alert("По вашему запросу ничего не найдено :(", null, "Сообщение", ["OK","Cancel"]);
        },1000);
    }
    //map.panTo(marker.getPosition());
}

function getObjById(id) {
    // вставляем сразу лоадер
    $('#footer').html('<div id="loading" style="position: relative; height: 100px; text-align: center;"><div class="mapPlaceholder"><div class="round1"></div></div></div>');
    var fbURL = "http://api.zemli78.ru/web/req";
    $.ajax({
        url: fbURL,
        data: {'id': id},
        type: 'GET',
        success: function (resp) {
            var results = resp;
            console.log(results);
            var template = getTemplate(results);
            $('#footer').html(template);
            showInfo();
            $('.owl-carousel').owlCarousel({
                items: 1,
                lazyLoad: true,
                autoplay: true,
                autoHeight: true
            });
        },
        error: function (e) {
            console.log('Error: ' + e);
        }
    });

    $('#footer').perfectScrollbar();
}

/***
 number - исходное число
 decimals - количество знаков после разделителя
 dec_point - символ разделителя
 thousands_sep - разделитель тысячных
 ***/
function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + (Math.round(n * k) / k)
                    .toFixed(prec);
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
        .split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '')
            .length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1)
            .join('0');
    }
    return s.join(dec);
}

function getTemplate(prop) {
    var photo_array = "";
    photo_array += "<img class='owl-lazy' style='min-height: 200px;' data-src='https://zemli78.ru/images/realty/villages/" + prop.row.village_photo + "'/>";
    $.each(prop.photos, function(index, value) {
        if (value.UF_FILENAME) {
            photo_array += '<div><img class="owl-lazy" style="min-height: 200px;" data-src="https://zemli78.ru/images/realty/country/'+value.UF_FILENAME+'" /></div>';
        }
    });
    var out = "<div class='cart'>" + (prop.row.village_photo ? "<div class='realty_photo owl-carousel'>" + photo_array + "</div>" : "") +
        "<p class='price'>" + number_format(prop.row.UF_PRICE * 1000, 0, '.', ' ') + " руб.</p>" +
        "<p class='sall'>" + prop.row.UF_TYPEOBJECT_TEXT + " на продажу: " + (prop.row.UF_SALL ? prop.row.UF_SALL + " м<sup>2</sup> " : "") + (prop.row.UF_SLAND ? prop.row.UF_SLAND + " сот." : "") + " </p>" +
        (prop.row.km_from_kad ? "<p class='kad'>Расстояние до КАД: " + prop.row.km_from_kad + " км</p>" : "") +
        (prop.row.UF_ADDRESS ? "<p class='address'>" + prop.row.UF_ADDRESS + "</p>" : "") +
        "<table><tr><td><a href='tel:"+prop.phone+"' class='btn btn-call'>Позвонить</a></td></tr></table>" +
        "<hr>" + (prop.row.UF_NOTES?"<div class='desc'>" + prop.row.UF_NOTES + "</div></div>":"");
    $('.btn-call').on('click', function(){
        console.log('call@@@!!!');
    });
    return out;
}

function showInfo() {
    $('#footer').slideDown(200);
    $('.backroll').show();
    changeSize();
}

function hideInfo(thisSel) {
    thisSel.hide();
    $('#footer').slideUp(200);
}

function changeSize() {
    $('#footer').perfectScrollbar('update');
}

function showFilters() {
    $('#search').slideDown(200);
    hideInfo($('.backroll'));
    return 1;
}

function hideFilters() {
    $('#search').slideUp(200);
    return 0;
}

function getFilters() {
    var fbURL = "http://api.zemli78.ru/web/get-filters";
    $.ajax({
        url: fbURL,
        type: 'GET',
        success: function (resp) {
            $('.search-form').html(resp);
            $('select').select2({
                width: '100%'
            });
        },
        error: function (e) {
            console.log('Error: ' + e);
        }
    });
}

jQuery('document').ready(function ($) {
    var openFilter = 0;
    var searchform = $('.search-form');
    $('#YMapsID').css('width', window.innerWidth);
    $('#YMapsID').css('height', window.innerHeight - 70);

    getMap();

    // TO DO: регистрация пользователя
    // var string = device.uuid;
    // console.log(string);

    $(window).resize(function () {
        $('#YMapsID').css('width', window.innerWidth);
        $('#YMapsID').css('height', window.innerHeight - 70);
        //myMap.redraw();
    });

    $('.backroll').click(function () {
        hideInfo($(this));
    });

    $('#side-search').click(function(){
        if (openFilter == 0) {
            openFilter = showFilters();
        } else {
            openFilter = hideFilters();
        }
    });

    $('.search-click').click(function() {
        openFilter = hideFilters();
        var data = searchform.serialize();
        console.log(data);
        var fbURL = "http://api.zemli78.ru/web/search";
        $.post(
            fbURL,
            data,
            function(resp) {
                showOnMap(resp);
            }
        );
    });

    $('.clear-form').click(function(){
        $('.search-form')[0].reset();
        getMap();
        openFilter = hideFilters();
    });


    var el = document.getElementById('footer')
    swipedetect(el, function(swipedir){
        //swipedir contains either "none", "left", "right", "top", or "down"
        console.log('You just swiped ' + swipedir);
        if (swipedir == "down" && el.scrollTop == 0) {
            hideInfo($('.backroll'));
        }
    });

    // var el2 = document.getElementById('search')
    // swipedetect(el2, function(swipedir){
    //     console.log('You just swiped ' + swipedir + " scroll " + el2.scrollTop);
    //     if (swipedir == "down" && el2.scrollTop == 0) {
    //         openFilter = hideFilters();
    //     }
    // });


});

function swipedetect(el, callback){

    var touchsurface = el,
        swipedir,
        startX,
        startY,
        distX,
        distY,
        threshold = 150, //required min distance traveled to be considered swipe
        restraint = 100, // maximum distance allowed at the same time in perpendicular direction
        allowedTime = 300, // maximum time allowed to travel that distance
        elapsedTime,
        startTime,
        handleswipe = callback || function(swipedir){}

    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface
        e.preventDefault()
    }, false)

    touchsurface.addEventListener('touchmove', function(e){
        e.preventDefault() // prevent scrolling when inside DIV
    }, false)

    touchsurface.addEventListener('touchend', function(e){
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        if (elapsedTime <= allowedTime){ // first condition for awipe met
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
                swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
            }
            else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
                swipedir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
            }
        }
        handleswipe(swipedir)
    }, false)
}

//USAGE:
/*
 */