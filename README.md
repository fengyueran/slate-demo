# 基于 slate 的布局

### Slate.js

Slate.js 本身提供了一个视图无关的内核 slate-core，如果采用 react 作为视图层，那么可以用 slate-react 来连接 React 与 Slate.js。
其主体架构如下图所示：
![](http://blog-bed.oss-cn-beijing.aliyuncs.com/62.%E5%AF%8C%E6%96%87%E6%9C%AC%E7%BC%96%E8%BE%91%E5%99%A8%E7%9A%84%E6%8A%80%E6%9C%AF%E6%BC%94%E8%BF%9B/slate-mvc.png)
可以看到它就是一个 MVC 的架构模式。其数据模型的设计宗旨就是 Mirror the DOM，即尽可能按照现行的 DOM 标准去抽象自己的数据模型，这种数据结构的好处在于用户能更快地上手，熟悉 html 就能容易地理解这个数据模型，并且可以让我们重用经过重重考验的结构模式，而不是自己造一个新的轮子。目前 State 数据模型大概是这个样子：

```
//json
[
  {
    "type": "paragraph",
    "children": [
      {
        "text": "Hello"
      }
    ]
  }
]
```

这个模型看起来非常简单，它定义了一个 type 类型为 paragraph 的 Element，事实上 Element 的结构非常自由：

```ts
interface Element {
  children: Node[];
  [key: string]: unknown;
}
```

可以看到，Element 可以添加任意的属性，比如用 type 来区分不同类型的 Element:

```
const paragraph = {
  type: 'paragraph',
  children: [...],
}

const image = {
  type: 'image',
  children: [...],
}
```

或者为 image 添加定制的属性 url：

```
const image = {
  type: 'image',
  url: "...",
  children: [...],
}
```

Element 除开 children 属性，其它可以自由发挥。不同类型的 Element 节点层级就构成了 Slate 的文档模型。

定义了不同的 Element 后就可以在 view 层通过自定义 renderElement 函数来定制 Element 地渲染：

```js
const ImageElement = (props) => {
  return (
    <div {...props.attributes}>
      <img src={props.element.url} />
      {props.children}
    </div>
  );
};

const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>;
};

const renderElement = (props) => {
  switch (props.element.type) {
    case "image":
      return <ImageElement {...props} />;
    default:
      return <DefaultElement {...props} />;
  }
};
```

由此，就能得到任意的布局方式。

### 布局方案

以上可以知道，想要不同的布局就是要定义不同类型的 Element：

- comments

  如果每一个 Element 都要支持 comments，那么在每一个 Element 的 children 下就会有 comments 类型的 Element：

  ```json
  [
    {
      "type": "h1",
      "children": [
        {
          "text": "Next Medical Report"
        },
        {
          "type": "comments",
          "comments": ["comments1", "comments2"]
        }
      ]
    },
    {
      "type": "paragraph",
      "children": [
        {
          "text": "this is paragraph"
        },
        {
          "type": "comments",
          "comments": ["comments1", "comments2", "comments3"]
        }
      ]
    }
  ]
  ```

  在 view 层定义好 comments 这种类型的 Element 的渲染方式：

  ```js
  const CommentsElement = (props) => {
    return (
      <div {...props.attributes}>
        {props.element.comments.map((comment) => (
          <p>{comment}</p>
        ))}
        {props.children}
      </div>
    );
  };

  const DefaultElement = (props) => {
    return <p {...props.attributes}>{props.children}</p>;
  };

  const renderElement = (props) => {
    switch (props.element.type) {
      case "comments":
        return <CommentsElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  };
  ```

- 纵横向的布局与拖动
  同样地，想要元素可以在水平方向排布，就可以创建一种新类型的 Element：

  ```json
  {
    "type": "row",
    "children": [...]
  }
  ```

  row 类型的 Element 渲染方式如下：

  ```js
  const Row = ({ attributes, children }) => {
    return (
      <div style={{ display: "flex" }} {...attributes}>
        {children}
      </div>
    );
  };
  ```

  可以看到通过设置 Element row 的显示方式为 flex 就可以使其子元素水平显示了。如果有一个 image 和一个 paragraph 是横向排列，那它的数据结构就类似于这样：

  ```json
  {
    "type": "row",
    "children": [
      {
        "type": "image",
        "url": "...",
        "children": []
      },
      {
        "type": "paragraph",
        "children": [{ "text": "this is paragraph" }]
      }
    ]
  }
  ```

  纵向也是如此，定义一个支持纵向排列的 Element:

  ```
   {
    "type": "column",
    "children": [...]
  }
  ```

  渲染方式如下：

  ```js
  const Col = ({ attributes, children }) => {
    return (
      <div style={{ display: "flex", flexDirection: "column" }} {...attributes}>
        {children}
      </div>
    );
  };
  ```

  row 和 column 的嵌套就可以组成复杂的布局了，数据结构可能就是这样：

  ```json
  {
    "type": "row",
    "children": [
      {
        "type": "image",
        "url": "...",
        "children": []
      },
      {
        "type": "column",
        "children": [
          {
            "type": "paragraph",
            "children": [{ "text": "this is paragraph" }]
          },
          {
            "type": "code",
            "children": [{ "text": "this is code" }]
          }
        ]
      }
    ]
  }
  ```

  要支持 Element 地拖动，还需要对 Element 进行增强：

  ```js
  const withDraggable = (Component, options) => {
    return (
      <Draggable>
        ...
        <Component {...props} />
      </Draggable>
    );
  };

  const DraggableImage = withDraggable(Image, {});
  ```

  Element 具备拖动能力后，根据 drag 和 drop 的位置，计算出要进行转换的 Element，通过 Slate 的 Transform 对节点进行操作，比如将 drag 的 Element 移动到 drop 位置，然后用 Row 这种类型的节点将他们包裹起来，这样就完成了这两个节点的水平排列布局。当然要完成其他的一些 dnd 操作还需要实现各种节点操纵的业务逻辑。基于此，实现了一个简单的[demo](https://bj.keyayun.com/xhm/nmr3/)。

- 其他

  如果有新的 layout 需求，就通过定义新的 Element 类型来达到目的，比如现在需要支持饼图，就定义饼图类型的 Element 数据结构、渲染方法以及对应的节点操作方法。所有这些 Element 的定义最终构成 layout 标准文件。
