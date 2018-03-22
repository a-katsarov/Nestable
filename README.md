# Nestable

Generate dynamic hierarchical lists utilising the fantastic HTML5 Drag & Drop API for sorting and nesting. Includes optional animations.

Inspired by the original and awesome [Nestable](https://github.com/dbushell/Nestable) lib written by [@dbushell](https://github.com/dbushell).

[Demo](https://s.codepen.io/Mobius1/debug/awKGVL)

#### Nestable is currently not production-ready so use with care.

---

No need for complex markup, just create an unordered list and pass a reference to it with the `list` property and `Nestable` will use it's children as list items:

```html
<ol id="list">
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
    <li>Item 4</li>
</ol>

```

```javascript
var nestable = new Nestable({
    list: "#list"
});
```

By default, all list items are draggable, but If you want to define which items are draggable then just pass a reference to them with the `draggable` property.


```html
<ol id="list">
    <li class="item">Item 1</li>
    <li class="item">Item 2</li>
    <li class="item">Item 3</li>
    <li class="item">Item 4</li>
    <li>Item 5</li>
    <li class="item">Item 6</li>
    <li class="item">Item 7</li>
    <li class="item">Item 8</li>
    <li>Item 9</li>
    <li>Item 10</li>
    <li>Item 11</li>
    <li>Item 12</li>
</ol>

```


```javascript
// Only elements with the "item" className will be draggable
var nestable = new Nestable({
    list: "#list",
    draggable: ".item"
});
```

By default, the list item is also the handle used to grab it. It's possible to redefine the handles by passing a reference to the element you want to use as a handle with the `handle` property:

```html
<ol id="list">
    <li>
        <header class="handle">Heading 1</header>
        <div>Content 1</div>
    </li>
    <li>
        <header class="handle">Heading 2</header>
        <div>Content 2</div>
    </li>
    ...
</ol>

```

```javascript
// Elements with the "handle" className will be used as handles
var nestable = new Nestable({
    list: "#list",
    handle: ".handle"
});
```

---

## To-Do List

* Push / pull to other lists
* Limit nesting level
* Fallback for browsers that don't support drag and drop?


---

# License

Copyright 2017 Karl Saunders

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.