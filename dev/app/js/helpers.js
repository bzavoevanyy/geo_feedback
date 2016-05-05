var source = document.getElementById('template').innerHTML;
var template = Handlebars.compile(source);
Handlebars.registerHelper('review', function() {
    return new Handlebars.SafeString(
        "<p>" + this.place + " - " + this.text + "</p>"
    );
});