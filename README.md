# CalDAV.js

CalDAV.js is a Node.JS module with functionalities of a CalDAV client.

### Version
1.0.3

### Documentation

CalDAV.JS initiation:
```js
var Caldav = require('caldav');

var client = new Caldav({
    host        : 'example.com',
    secure      : false, // Use of HTTPS or HTTP. Default HTTP
    port        : 8888, // Default port is 5232
    credentials : {
        user     : "demo",
        password : "demo"
    }
});
```


CalDAV.JS has currently this functions

- createCalendar: Creates a calendar with the specific name and color and returns the new calendar's URL
```js
client.createCalendar({
    name: "Calendar42",
    color: {
        name: "****",
        color: "#424242"
    }
}, homePath, function (err, calendarUrl) {
        //...
});
```

- createEvent: Creates an event in the given calendar and returns the new event's URL
```js
client.createEvent({
    name: "Calendar42",
    time: {
        start: new Date(),
        end: new Date()
    }
}, calendarPath, function (err, eventUrl) {
        //...
});
```

- deleteCalendar: Deletes the specific calendar
```js
client.deleteCalendar(calendarPath, function (err) {
        //...
});
```

- deleteEvent: Deletes the specific event
```js
client.deleteEvent(eventPath, function (err) {
        //...
});
```

- getCalendars: Returns all the user's calendars objects in an array.
```js
client.getCalendar(homePath, function (err, calendars) {
        //...
});
```

- getHome: Returns the users path as a string:
```js
client.getHome(function (err, home) {
        //...
});
```

- getCalendarHome: Returns the user's calendars path
```js
client.getCalendarHome(function (err, calHome) {
        //...
});
```

- listCalendarEvents: Returns all the event objects from a calendar
```js
client.listCalendarEvents(calendarPath, function (err, events) {
        //...
});
```

- modifyCalendar: Modify the given properties of the specific calendar 
```js
client.modifyCalendar({
    name: "New Name"
}, calendarUrl, function (err) {
        //...
});
```

- modifyEvent: Modify the given properties of the specific event
```js
client.modifyEvent({
    name: "New Name",
    time: {
        end: new Date()
    }
}, eventObj, function (err) {
        //...
});
```

License
----

MIT
