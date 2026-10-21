import { OwlybookApp } from "./app/owlybook_app";
import { startOwlybook } from "./story/boot";

// The whole Owlybook as a static site, see /owlybook/export_site.
startOwlybook(OwlybookApp, { offline: true, shippedBundles: ["web.ace_lib"] });
