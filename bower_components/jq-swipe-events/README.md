# jQuery swipe event

Plugin lets to use swipe touch events.

# Install with bower
```
bower install jq-swipe-events
```

# Usage

## Main swipe event
```javascript
$(selector).on('swipe', function(e) {
    // your actions
});
```

## Swipe event object

Swipe event object is extended `touchmove` event. Following properties are added:

- **e.swipeDeltaX**: Number,
    positive for `swipeRight`
    negative for `swipeLeft`
    
- **e.swipeDeltaY**: Number,
    positive for `swipeDown`
    negative for `swipeUp`
    
- **e.originalEvent** - native event object

## TODO
- add directional swipe events