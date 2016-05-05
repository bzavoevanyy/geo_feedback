function server() {
    function respond() {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://smelukov.com:3000', true);
        return xhr;
    }
    return {
        add: function (data) {
            return new Promise(function (resolve, reject) {
                var xhr = respond();
                xhr.addEventListener('loadend', function () {
                    if (xhr.status == 200) {
                        resolve(xhr.response)
                    } else {
                        return reject('Ошибка сервера!');
                    }
                });
                xhr.send(JSON.stringify(data));
            }).catch(function (e) {
                console.log(e);
            })
        },
        get: function (data) {
            return new Promise(function (resolve, reject) {
                var xhr = respond();
                xhr.addEventListener('loadend', function () {
                    if (xhr.status == 200) {
                        resolve(xhr.response)
                    } else {
                        return reject('Ошибка сервера!');
                    }
                });
                xhr.send(JSON.stringify({op: 'get', address: data}));
            }).catch(function (e) {
                console.log(e);
            })
        },
        all: function () {
            return new Promise(function (resolve, reject) {
                var xhr = respond();
                xhr.addEventListener('loadend', function () {
                    if (xhr.status == 200) {
                        resolve(xhr.response)
                    } else {
                        return reject('Ошибка сервера!');
                    }
                });
                xhr.send(JSON.stringify({op: 'all'}));
            }).catch(function (e) {
                console.log(e);
            })

        }
    }
}
