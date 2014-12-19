
# angular-feathers-example

This is an example application that demonstrates the use of angular-feathers with full CRUD and authentication. It inclues a nodejs server running feathers which serves an angularjs application from its `public` directory. **You'll need a working install of mongodb to run this.**

You probably write your angular apps differently. No doubt, your style, coding conventions, directory structure, and taste in coffee are far superior to mine. This is a demo. Relax and give it a test drive. As long as you can see how angular-feathers works, this app's done its job.

To be clear, if you were to clone this and use it in a production environment, that'd be a really bad idea, and someone would probably throw something heavy at you for doing it. **This is not production-ready code**.

Still, I wanted it to look nice. To that end, I've used code, markup, and resources from the following Open Source projects:

- [Start Bootstrap - Simple Sidebar](https://github.com/ironsummitmedia/startbootstrap-simple-sidebar) layout by David Miller
- [Bootswatch Slate](https://github.com/thomaspark/bootswatch/) theme by Thomas Park ([packaged for Bower](https://github.com/dbtek/bootswatch-dist) by İsmail Demirbilek)
- [AngularJS MultiSelect by Ignatius Steven](https://github.com/isteven/angular-multi-select)
- [Sign in Panel](http://bootsnipp.com/snippets/featured/sign-in-panel) markup from bootsnipp, designed by [jordi](http://bootsnipp.com/jordi)

My sincere thanks to these authors for sharing their hard work with the rest of us.


## How do I run this thing?

    npm install
    bower install
    node server.js

Then open your browser to [http://localhost:3000](http://localhost:3000)

You'll want to click the [Sign Up Here](http://localhost:3000/#/signup) link at the bottom of the login panel and create a new account.


