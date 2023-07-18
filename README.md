<h1 align="center">🦉 <a href="https://github.com/fdardenne/owlybook">Owlybook</a> 🦉</h1>

Owlybook is a tool for developing Odoo UI components in isolation to help developers create and test UI components outside of the context of the overall application.

With Owlybook, developers can create and organize "stories", which are individual UI components or groups of components that can be viewed and tested in isolation. 
Each story represents a specific state or use case of the component, allowing developers to easily see how the component behaves under different conditions. 
Developers can browse through stories, view the code for each component, and make adjustments in real-time.

![owlybook](https://github.com/fdardenne/owlybook/assets/109217759/e4369406-b4e8-4e95-a835-1c95f5e20e6a)

## How to use it

To use Owlybook in your Odoo server

- Clone this repository
- Add the cloned folder in your Odoo addons folder
- Start the Odoo server and install the module
- Go to <server_url>/owlybook

## Create a story

There is two type of stories in Owlybook:
- Stories that represent Owl components
- Stories that represent views arch written in XML. In Odoo, an arch is a part of the XML code that defines the structure and layout of a view. 

### Create a component story

To create a story for your component:

Create a new JavaScript file representing the new story in the `static` folder of your module. By convention you can name it `component_name.stories.js`.

Here is a simple template of a story, we will explain the key points later:

```js
/** @odoo-module */

import { MyComponent } from "@my_module/my_component";
import { registry } from "@web/core/registry";
import { Component, onMounted } from "@odoo/owl";

class ParentStory extends Component {
    static template = "myModule.MyComponentStory";
    static components = { MyComponent };
}

ParentStory.codeTemplate = "myModule.MyComponentCall";
ParentStory.storyConfig = {
    title: "This is my beautiful story",
    component: MyComponent,
    props: {
        canToggle: {
            value: true,
            help: "With this props we can defined if the component can be toggled or not"
        },
        colors: {
            value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            readonly: true,
        },
        selectedColor: {
            value: 9,
        },
    },
};

export const MyComponentStories = {
    title: "Name of the folder title",
    module: "my module",
    stories: [ParentStory],
};

registry.category("stories").add("myModule.myComponentStories", MyComponentStories);

```

- `class MyComponentStory extends Component`

  Here we create a parent component that will render the component for which we want to create a story. 
  
  This parent component will receive two props:
  - `storyProps` is the story component props. Initially `storyProps` take the values defined in `ParentStory.storyConfig.props`, if
     the props is not defined or no default values is assigned then it takes the default value from the props validation of the component.
     When the user change the props in the UI, `storyProps` is updated to reflect the user choices.
  - `changeProps(propsName, newValue)` is a callback function, with this function the story parent can change the props of the story component to simulate
     some changes.

- `static template = "myModule.MyComponentStory"`

   This is the templates where the documentation and the component rendering will take place. 
   Here is the template of the story:
   
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
    <templates xml:space="preserve">
        <t t-name="myModule.MyComponentStory" owl="1">
            <h1> My Component </h1>

            <p> Hello world </p>
            <t t-call="myModule.MyComponentCall"/>

        </t>

        <t t-name="myModule.MyComponentCall" owl="1">
          <ColorList t-props="props.storyProps"/>
        </t>
    </templates>
   ```

- `ParentStory.codeTemplate = "myModule.MyComponentCall"`

  As you noticed in the previous point, there is a second template: `myModule.MyComponentCall`. 
  This template is shown in the template tabs of the component so users are not confused with he documentation template.
  
- `ParentStory.storyConfig =` 

  This is the story metaData
  
  - `title`: the title of the story
  - `component`: the component of the story, this is needed so Owlybook can search the props validation of the component
  - `props`: an object taking props name as key so we can provide additional information about each props if needed
     - `value`: the default value of the props in the story. If `value` key is not mentioned then the default value assigned in the props validation component is taken
     - `help`: take a string as value and provide a tooltip in the interface next to the props name
     - `readonly`: take a boolean, if true then users will not be able to modify the props interactively
     
- `export const MyComponentStories =`

  This variable defines the stories folder
  
  - `title`: the title of the folder shown in the sidebar
  - `module`: the module of the stories in which the folder appears
  - `stories`: an array of story
  
- `registry.category("stories").add("myModule.myComponentStories", MyComponentStories);`

  This line is necessary to register the story in the registry in which owlybook will fetch the stories.

## Credits

- Owlybook is inspired by <a href="https://storybook.js.org/">Storybook</a> but for Owl and Odoo
- The Odoo JavaScript framework team without whom this project would not have been achieved

