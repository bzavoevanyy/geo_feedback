new Promise(function (resolve) {

    var cords = [];
    navigator.geolocation.getCurrentPosition(function (pos) {
        cords.push(pos.coords.latitude);
        cords.push(pos.coords.longitude);
        resolve(cords);
    });

}).then(function (cords) {
    var myMap;
    // Дождёмся загрузки API и готовности DOM.
    ymaps.ready(init);
    function init() {
        // Создание экземпляра карты и его привязка к контейнеру с
        // заданным id ("map").
        myMap = new ymaps.Map('map', {
            // При инициализации карты обязательно нужно указать
            // её центр и коэффициент масштабирования.
            center: cords,
            zoom: 12
        }, {
            searchControlProvider: 'yandex#search'
        });
        myMap.events.add('click', function (e) {
            if (!myMap.balloon.isOpen()) {
                var coords = e.get('coords'),
                    clientCoords = e.getSourceEvent().originalEvent.clientPixels;
                console.log(e.getSourceEvent());
                reviewbox.style.display = "block";
                reviewbox.style.top = clientCoords[1] + 'px';
                reviewbox.style.left = clientCoords[0] + 'px';
                ymaps.geocode(coords).then(function (res) {
                    console.log(coords);
                    console.log(res.geoObjects.get(0).properties.get('text'));

                    myPlacemark = new ymaps.Placemark(coords, {
                        hintContent: 'Москва!',
                        balloonContent: 'Столица России'
                    });
                    myMap.geoObjects.add(myPlacemark);

                });
                //console.log(adress);
                //myMap.balloon.open(coords, {
                //    contentHeader:'Событие!',
                //    contentBody:'<p>Кто-то щелкнул по карте.</p>' +
                //    '<p>Координаты щелчка: ' + [
                //        coords[0].toPrecision(6),
                //        coords[1].toPrecision(6)
                //    ].join(', ') + '</p>',
                //    contentFooter:'<sup>Щелкните еще раз</sup>'
                //});


            }
            else {
                //myMap.balloon.close();
            }
        });
    }


});
