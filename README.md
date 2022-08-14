# Hell Let Loose tactical map generator

This service dynamically renders tacmaps for the first person shooter Hell Let Loose.

To see it in action head over to the [HeLO-System website](https://helo-system.de/tacmaps) and check it out there or use the api under [https://tacmaps.helo-system.de/tacmap](https://tacmaps.helo-system.de/tacmap)

If you want to support this service you can find our donation link on the HeLO-System website.

| Param                   | Options                                                      | Description                                            |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| map                     | [https://tacmaps.helo-system.de/maps](/maps)                 | This is the map you want displayed                     |
| strongpoints            | [https://tacmaps.helo-system.de/strongpoints](/strongpoints) | list of strongpoints you want displayed on the map     |
| width                   | x < 1920                                                     | Width of the output image                              |
| height                  | x < 1920                                                     | Height of the output image                             |
| axisColor / alliesColor | red or blue                                                  | must always be used with the corresponding caps param  |
| axisCaps / alliesCaps   | 0 > x <= 5                                                   | must always be used with the corresponding color param |
