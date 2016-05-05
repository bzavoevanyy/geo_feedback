// Глобальные переменные
var myMap,
    placemark,
    clusterer,
    customItemContentLayout;
body.addEventListener('click', function (e) {
    if (e.target.className == 'save') { // сохраняем отзыв
        var data = {
            review: {
                coords: {}
            }
        };
        e.preventDefault();
        var coords = document.getElementsByName('coords')[0].value.split(',');
        data.op = 'add';
        data.review.coords.x = coords[0];
        data.review.coords.y = coords[1];
        data.review.address = document.getElementsByClassName('review-box__header')[0].innerText.trim();
        data.review.name = document.getElementsByName('name')[0].value;
        data.review.place = document.getElementsByName('place')[0].value;
        data.review.text = document.getElementsByName('text')[0].value;
        server().add(data).then(function () {
            hbswrap.innerHTML = "";
            var d = new Date();
            data.review.date = d.toDateString();
            clusterer.add(addPlacemark(data.review));
        });
    } else if (e.target.id == 'address') { //клик по ссылке адреса
        e.preventDefault();
        var respond = e.target.innerText;
        server().get(respond).then(function (response) {
            myMap.balloon.close();
            var res = JSON.parse(response)[0];
            var address = res.address;
            var obj = {
                coords: [res.coords.x, res.coords.y],
                address: address,
                clientCoords: {top: e.clientY + 'px', left: e.clientX + 'px'},
                reviews: JSON.parse(response)
            };
            showRevWin(obj); // выводим окно формы отзыва
        });
    } else if (e.target.id == "close") {
        hbswrap.innerHTML = "";
    }
});
new Promise(function (resolve) {
    var cords = [];
    navigator.geolocation.getCurrentPosition(function (pos) {
        cords.push(pos.coords.latitude);
        cords.push(pos.coords.longitude);
        resolve(cords);
    });
}).then(function (cords) {
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
        customItemContentLayout = ymaps.templateLayoutFactory.createClass(
            // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
            '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
            '<div class=ballon_body><a id="address" href="#">{{ properties.balloonContentBody|raw }}</a><br>{{properties.balloonContentReview|raw}}</div>' +
            '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
        );
        clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            // Устанавливаем стандартный макет балуна кластера "Карусель".
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            // Устанавливаем собственный макет.
            clusterBalloonItemContentLayout: customItemContentLayout,
            // Устанавливаем режим открытия балуна.
            // В данном примере балун никогда не будет открываться в режиме панели.
            clusterBalloonPanelMaxMapArea: 0,
            // Устанавливаем размеры макета контента балуна (в пикселях).
            clusterBalloonContentLayoutWidth: 200,
            clusterBalloonContentLayoutHeight: 130,
            // Устанавливаем максимальное количество элементов в нижней панели на одной странице
            clusterBalloonPagerSize: 5
        });
        // Заполняем кластер геообъектами.
        var placemarks = [];
        server().all().then(function (response) {
            var reviews = JSON.parse(response);
            for (var prop in reviews) {
                reviews[prop].forEach(function (obj) {
                    var d = new Date(obj.date);
                    obj.date = d.toDateString();
                    placemark = addPlacemark(obj);
                    placemark.events.add('click', function (e) {
                        hbswrap.innerHTML = "";
                    });
                    placemarks.push(placemark);
                })
            }
            clusterer.add(placemarks);
            myMap.geoObjects.add(clusterer);
        });
        myMap.events.add('click', function (e) {
            myMap.balloon.close();
            var coords = e.get('coords'),
                clientCoords = e.getSourceEvent().originalEvent.clientPixels;
            ymaps.geocode(coords).then(function (res) {
                var address = res.geoObjects.get(0).properties.get('text');
                var obj = {
                    coords: coords,
                    address: address,
                    clientCoords: {top: clientCoords[1] + 'px', left: clientCoords[0] + 'px'}
                };
                server().get(address).then(function (response) {
                    obj.reviews = JSON.parse(response);
                    showRevWin(obj);
                });
            });
        });
    }
});
function showRevWin(obj) { // функция вывода окна отзыва
    var html = template(obj);
    hbswrap.innerHTML = html;
}
function addPlacemark(obj) { //функция добавления плейсмарка
    return new ymaps.Placemark([obj.coords.x, obj.coords.y], {
            // Устаналиваем данные, которые будут отображаться в балуне.
            balloonContentHeader: obj.place,
            balloonContentBody: obj.address,
            balloonContentReview: obj.text,
            balloonContentFooter: obj.date
        }, {
            balloonContentLayout: customItemContentLayout
        }
    );
}