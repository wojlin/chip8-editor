|    line     | memory (dec) | memory (hex) |    sprite    |    instruction    |                             comment                             |    notes    |
|:------------|:------------:|:------------:|:------------:|:-----------------:|:---------------------------------------------------------------:|------------:|
|      1      |     512      |    0x200     |      ☐       |       B206        |                   Jump to location 518 + V0.                    |  nice code  |
|      2      |     514      |    0x202     |      ☑       | 01100110 11111111 |                    ⬛⬜⬜⬛⬛⬜⬜⬛<br>⬜⬜⬜⬜⬜⬜⬜⬜<br>                     |  nice code  |
|      3      |     516      |    0x204     |      ☑       | 11111111 11111111 |                    ⬜⬜⬜⬜⬜⬜⬜⬜<br>⬜⬜⬜⬜⬜⬜⬜⬜<br>                     |  nice code  |
|      4      |     518      |    0x206     |      ☑       | 01111110 00111100 |                    ⬛⬜⬜⬜⬜⬜⬜⬛<br>⬛⬛⬜⬜⬜⬜⬛⬛<br>                     |  nice code  |
|      5      |     520      |    0x208     |      ☐       |       601E        |                          Set V0 = 30.                           |  nice code  |
|      6      |     522      |    0x20a     |      ☐       |       610A        |                          Set V1 = 10.                           |  nice code  |
|      7      |     524      |    0x20c     |      ☐       |       A202        |                          Set I = 514.                           |  nice code  |
|      8      |     526      |    0x20e     |      ☐       |       D016        | Display 6-byte sprite starting at memory location I at (V0, V1) |  nice code  |
