import { Characters } from "../../../types";

const InitialCharacters: Characters = {
  jizye5ng66r: {
    id: "jizye5ng66r",
    name: "Flag",
    rules: [],
    spritesheet: {
      appearances: {
        ax1: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAABE0lEQVRYR+2Y2xGEIAxFtbTtZEuxlO1kS2PxgYMZsnkZ5CN+OoQcLpcEnSe/J1VTz9o06kAsYabawMDE6jzqQAhYwMr7YQAh2DCAGNijgBRUve1li9M3+/EFLck/MiwPSsBqBQ+4xpm5CVADdqbelUN23AhoAjtyu5ziO8CgZC4evAN0VdDdg6saalhPD1JtjGNxFw9yEpcxlLJd6yAF3oLt5kEKDr00POFBIeyY98FqERugSx0UKoUe+i51UAub4ZJbL9ZCgbjwoFXIFB40ShgeNAo4hQfNClYTsL4eWwnVgQz66MUMkfAh0YtN8u3BUaitIkahFim4vC+eu8QuH+f/gy3Sf0DUyiTA4k5iAYPgHNAfkPFqKStkGYEAAAAASUVORK5CYII=",
        ],
      },
      appearanceNames: {
        ax1: "Idle",
      },
    },
    variables: {},
  },
  aamlcui8uxr: {
    id: "aamlcui8uxr",
    variables: {
      _2045001: {
        defaultValue: "0",
        name: "Age",
        id: "_2045001",
      },
    },
    rules: [
      {
        id: "1483692901714",
        type: "group-event",
        rules: [
          {
            type: "rule",
            mainActorId: "1483668698770",
            conditions: {
              1483668698770: {
                appearance: {
                  enabled: true,
                },
              },
            },
            actors: {
              1483668698770: {
                variableValues: {},
                appearance: "_2220533",
                position: {
                  x: 0,
                  y: 0,
                },
                characterId: "aamlcui8uxr",
                id: "1483668698770",
              },
            },
            actions: [
              {
                actorId: "1483668698770",
                type: "appearance",
                to: "1483692402546",
              },
            ],
            extent: {
              xmin: 0,
              xmax: 0,
              ymin: 0,
              ymax: 0,
              ignored: {},
            },
            id: "1483692932203",
            name: "Turn Right",
          },
          {
            type: "rule",
            mainActorId: "1483668698770",
            conditions: {
              1483668698770: {
                appearance: {
                  enabled: true,
                },
              },
            },
            actors: {
              1483668698770: {
                variableValues: {},
                appearance: "1483692402546",
                position: {
                  x: 0,
                  y: 0,
                },
                characterId: "aamlcui8uxr",
                id: "1483668698770",
              },
            },
            actions: [
              {
                actorId: "1483668698770",
                type: "move",
                delta: {
                  x: 1,
                  y: 0,
                },
              },
            ],
            extent: {
              xmin: 0,
              xmax: 1,
              ymin: 0,
              ymax: 0,
              ignored: {},
            },
            id: "1483692914037",
            name: "Walk Right",
          },
        ],
        event: "key",
        code: 39,
      },
      {
        id: "1483692898285",
        type: "group-event",
        rules: [
          {
            type: "rule",
            mainActorId: "1483668698770",
            conditions: {
              1483668698770: {
                appearance: {
                  enabled: true,
                },
              },
            },
            actors: {
              1483668698770: {
                variableValues: {},
                appearance: "1483692402546",
                position: {
                  x: 0,
                  y: 0,
                },
                characterId: "aamlcui8uxr",
                id: "1483668698770",
              },
            },
            actions: [
              {
                actorId: "1483668698770",
                type: "appearance",
                to: "_2220533",
              },
            ],
            extent: {
              xmin: 0,
              xmax: 0,
              ymin: 0,
              ymax: 0,
              ignored: {},
            },
            id: "1483692956386",
            name: "Turn Left",
          },
          {
            type: "rule",
            mainActorId: "1483668698770",
            conditions: {
              1483668698770: {
                appearance: {
                  enabled: true,
                },
              },
            },
            actors: {
              1483668698770: {
                variableValues: {},
                appearance: "_2220533",
                position: {
                  x: 0,
                  y: 0,
                },
                characterId: "aamlcui8uxr",
                id: "1483668698770",
              },
            },
            actions: [
              {
                actorId: "1483668698770",
                type: "move",
                delta: {
                  x: -1,
                  y: 0,
                },
              },
            ],
            extent: {
              xmin: -1,
              xmax: 0,
              ymin: 0,
              ymax: 0,
              ignored: {},
            },
            id: "1483692943393",
            name: "Walk Left",
          },
        ],
        event: "key",
        code: 37,
      },
      {
        id: "14836928982851",
        type: "group-event",
        rules: [
          {
            type: "rule",
            mainActorId: "1483668698770",
            conditions: {
              1483668698770: {},
            },
            actors: {
              1483668698770: {
                variableValues: {},
                appearance: "1483692402546",
                position: {
                  x: 0,
                  y: 0,
                },
                characterId: "aamlcui8uxr",
                id: "1483668698770",
              },
            },
            actions: [
              {
                actorId: "1483668698770",
                type: "move",
                delta: {
                  x: 0,
                  y: 1,
                },
              },
            ],
            extent: {
              xmin: 0,
              xmax: 0,
              ymin: 0,
              ymax: 1,
              ignored: {},
            },
            id: "1483693012624",
            name: "Fall Down\n\n",
          },
        ],
        event: "idle",
      },
    ],
    spritesheet: {
      appearanceNames: {
        _2220533: "Left",
        1483692402546: "Right",
      },
      appearances: {
        _2220533: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAACW0lEQVRYR+2YP1KDQBTGl9p7YGPlTBobodZOr+BwADyAF8gBGBsPkHT0xMYmrU3Se4TM2K3zgLd5LPsfCBQyFoYHu79833tvn0Zs4VeEfAXnPIsi8Xkp3DVQXlU8ThI2FiCvGId1o5QN/sICcJ0krGBsECSCsWtYiTF2yAZDim84VMUeHObIIat/U6nJWaN0Ha9/+tcogDUcUU1sA/daQAHS2g5wCIWgKsgOYIjNHeUkGGWhpWfF4F2qLIUmyp6XGWKzALWVfwsoP2a1GKs5SMWiaHIpbvLNeAFgRZ5I9fnX5mZXwUGAuJQJVAIEi1XWKi1GFX17IkcFZekcFA0C9FFRC0dhDaBYJDoVe70HCiUU8GW/Z++rlToFNZC200bZHH2q2UlBQ24GA7qq6AMYZVkkt6PFAdq6kKI/9l9BiyHiMuG4qAjq+cL1+iAuALPhcbdjrjbDeybIUDgtIO2HripWm1xMJvBO+rzuKEbjcsykrFZ2H5th8/R7K/apbp56e0Ic7vvAGRX0UVEG1CkyO6BOOQSeDBBmFPnPATnnECK5i4WAu68jk60f1WKVzRSMwqhsvThgvH2tOWxg8IwMB/dGtxgVTE8nIdDD7Y+x3wJY3WZIVU+Wg7hwWZaixyEggqCi9LMKbjIFYWEKePXbzOs02WdrM0YvSfAf0FUp7QkhHXUXO0lcwRdtsSvcpFVsUrIzRlkmGrn6XRwKmnJF493k/LNci33uH/POnjQGAYiPfhbb1NNBgLKzAtoAVPEQFYMtXiwgLQrZwreP839JZ1NQHlQppCugTzX/AaMEqTgXygeQAAAAAElFTkSuQmCC",
        ],
        1483692402546: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAACaklEQVRYR+2YPU7DMBSAnQ2pR2AvS9cuLDR7tnIAFpQD9AIcgB4g4gqwwZyysFRiYiH3YA56Tp77/HD87CS0ESJCSlMn9pfv/dQiURM/kqnyFXVd50mSjAZYl6qGl01SNcqcAFjtduNMpuEuiiYYn7k+DQHV9pRSGwmwVo0VvaD+sw+0ZuBweCAk2tumaXeIEQ7B4Np8bsNpcMFeC6W/Izb7mBQBKQysB6ZgIWO0DCgtAh0DScPrNajBSIgtpBDAnnlI7bWp5behISlQqpR13fV41RRNkufBVc3tiYAYalMM8IQE2IKZ4jo6oGCMD8cahN4HuUe6h3tFb9XSR5gx12whkK7wiiHGxawQB8Dd7vfqYbk0d54GMMBcTB7y6hVDTEVxg7onFoX5lZG6omSwK7zBIXYBTB5QN/IAi5I9mAcMwplX8CCDpoA8kKFwuHOZr1YK9oA0YsFdHh8qHzcm99LrrfU8HdM9nY27UsVnr7dBAEk/nlS5WP9YE743L7NYi5C/CihVL7yAz6IEN9ggNcVh0fBkAFeXc8O4e6ucciks9j7Y87iqN6pR89UwB6lBCuiio9AAGhLe0UIME0G+SZBwH4JW63v9Hj57owIiJJwl0Jf380Olz2bW9orbj+6DGqRtM65Q0tYDoDS0CE4BsyzzMowOSKF5m8FG/nUG2/LmmBSg1Ddd40c1+A9o+p6nSHw5ODmD2HpCdjVd8L1z0DUh38ngPScBfH3eWoxX2ca6puMw1heyt0EXIEBAr+saO0oOugBgYWppTMhog38CEIze3Rz+O4uG+xRNlEH8LeU5xkPMAXkBxRTMNxpi2xi8o4tjAAAAAElFTkSuQmCC",
        ],
      },
    },
    name: "Hero",
  },
  us3zr9c0udi: {
    id: "us3zr9c0udi",
    rules: [],
    variables: {},
    spritesheet: {
      appearanceNames: {
        idle: "Idle",
      },
      appearances: {
        idle: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAABf0lEQVRYR+2XsXaCMBSGw2N4XHwId2Vnk8XNrQ9A98ZdHsCp3brULbtl70N06xM4U240nAA3AULU65GMYMKX/7//jQkY8REQ52NWwONXkmerFN3D5Dvxsre/Zcp4YOboBMi3My8w2CL87Xc4oC+16oAv2YE5A0p7RWHvO2MA+JnhVrtKu14kbDjgpf5IA16r/sBaNZxCAhaHcSpDtD8m+VUsDs/r24bxB6QBVUD4x7k/kVPQBgjp82G3TLGrxSNgUTaDFVQJrtfg3S2u2zsC9u2Do4IXxZxDQlrB8i9WsUt1ipAKCabeCNgnxaQVNNUfGYsfAhDOX75huZ5gUgqSB4RrZl09Egra6u+pAaensOyCURShFzj58B4Kvs5Fo0VjkCWgKSA+LcagdEovgG0Xbdv7NkAMNtCPN6wH+rwX9wGE74KiNwXUFeoCWwGEyVgP9KkgrNUFTN9IebSZ7BVC5GrC7icaUoJybh9AqaACowgIG6oAzuNmb9Ilu7WC8O1/ur0emClLsBQAAAAASUVORK5CYII=",
        ],
      },
    },
    name: "Rock",
  },
  oou4u6jemi: {
    id: "oou4u6jemi",
    rules: [],
    variables: {},
    spritesheet: {
      appearanceNames: {
        idle: "Idle",
      },
      appearances: {
        idle: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAABlElEQVRYR+3YWxKDIAwF0LpDF+GyXIQ7tOIIE2PCTXionWk/q8DxBkQdPi//DbW+aZpW1Mc8z8XjFDW0oDS0F+sC1sA42Ao1AVvCvFAI9ODGcUzjL8uCpmY6nkszCyzBeWD0CjSkCvTiSmEIKQK9uDBIC2Dohyd5AXpw5knmPJEiHwPSBcUroAJ7pGdd2eE8Ok0i8pRgDyCtLkfkjl2AvXER40WmBO8CBqiGlMpsBuYmtXORqkCOD2XegSi9XFm8OHQ+H8sERJ22PN4dyKcC2mU4qBswwviWh6aHdJz+93iJ/8DaBVKdIJpDPYC0TzgHXwE8xOt2w74E0hOI+k47SQ3Quq+WTIUL8Nj2xBTpn9K9jjdq8QrAgWEMscwlV1/bRnxg/QXg4yluycXw9zuM9Nq5f62SVnRt2Wh76fmS4zTgYykewFNouU8ftyQZU5XSyyUY292C1HAW4F5u75xEDwBCaqoFfn6Lu0zs1LJ40FM1SQyGZAU2Lbm0GLQ7hBeYSu4pO0sMpkaxJUDaHn7hP04uHucLIm4Vu7le3n8AAAAASUVORK5CYII=",
        ],
      },
    },
    name: "Boulder",
  },
  1483692598319: {
    id: "1483692598319",
    name: "Lava\n\n",
    rules: [
      {
        type: "rule",
        mainActorId: "1483692730066",
        conditions: {
          1483692730066: {
            appearance: {
              enabled: true,
            },
          },
        },
        actors: {
          1483692730066: {
            variableValues: {},
            appearance: "1483692615578",
            position: {
              x: 0,
              y: 0,
            },
            characterId: "1483692598319",
            id: "1483692730066",
          },
        },
        actions: [
          {
            actorId: "1483692730066",
            type: "appearance",
            to: "idle",
          },
        ],
        extent: {
          xmin: 0,
          xmax: 0,
          ymin: 0,
          ymax: 0,
          ignored: {},
        },
        id: "1483692986828",
        name: "Waves 1 => 2",
      },
      {
        type: "rule",
        mainActorId: "1483692743355",
        conditions: {
          1483692743355: {
            appearance: {
              enabled: true,
            },
          },
        },
        actors: {
          1483692743355: {
            variableValues: {},
            appearance: "idle",
            position: {
              x: 0,
              y: 0,
            },
            characterId: "1483692598319",
            id: "1483692743355",
          },
        },
        actions: [
          {
            actorId: "1483692743355",
            type: "appearance",
            to: "1483692615578",
          },
        ],
        extent: {
          xmin: 0,
          xmax: 0,
          ymin: 0,
          ymax: 0,
          ignored: {},
        },
        id: "1483692974417",
        name: "Waves 2 => 1",
      },
    ],
    spritesheet: {
      appearances: {
        idle: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAABfklEQVRYR+2XsXXDIBCGjxmyg3dIZ+3g3uk0gAbw8wAagC7pXbpHc3iHzEDeIYERYECCWCqOyjrdf/fdL8STGexgSQGSNcBCKF4QkzHxlaD2PKl+Qeo1ELrRkuFScKrWGphamtij1T02BcwZ1AMUXaf2YGw1fe/rbmmdXbM5+TWCL4nkXAENH48o1PHUw3DrTI7dQAJIvIc50SUAhvtU43Oe6QKLaWCGgKxtGTZJOefeZwBGd/3y1ZdvK8Y5QNuqwNA9BzUZDjDGj78HUIBa6LUQVuTBx4upCf60oS7nufr6M16reLN09ClfoAN47ukCOOWrdRinx8YzZ+whAloNmovo1h4B3aXdwrgFZhyx8113EsApUHegMGCqyhvvE2Cp2eQgOagdUOefcxiXupOjpz2Y41IshxwkB0sdKNVvugdzjq5VgDmFS53T+lWAsea14asD1nLu3xwkQPPHaIMPg5D7tAdL9yQ5+HYHSw/ipfpdPeIQ/K4A6ZgpfSFC+j8LJLz4CwieagAAAABJRU5ErkJggg==",
        ],
        1483692615578: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAABbElEQVRYR+2WwZHCMAxF5Rq4pQHaID1w55gCKGBnC0gBOXLfHsiJHqCA3KjBO3LijDGbSJbBITvOjUT6//lb9qDgwx+Vmk+fQaOnKoHlzSqaWoTuGmNmDIuKpYWAXDij65ujKdssoNb6fDwgNVJ2BOwYPCTopifZPspc8v0JcBQpqlk95YyHBtDub2zEdxIgtwc1DeCY1gDV/hxntct9raYAqN5QaGX2vBzaugbayy1U46F+t6mhvfcL3O1rUssuaKztGtNjOXpAfDGIGuENLez3uCSz/dsewH/+CgZ1RkByqQsVZMDY4HOCb0vw+wTwdQiUxxN6nb/gAxXzKQ4N7Klefki87ZSMBKdHDhidDU8gA/Jymq5ad4KcIY5NiOpfPkHicl8ekIhwxYAT0aeeyxUnSB0v//sb/smgRdIEJeORFDB0U5InmAElCcT2sGZQMtyxYLafBfgqM1+Hs/BFATkLfx3gf7ioOYn5Nb+SC8fGgab5wwAAAABJRU5ErkJggg==",
        ],
        1483692635012: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAyUlEQVRYR+2V2xFAMBBFNzUoQhu6UYA6FKAa2lCEGmLM8MNE7srLTtb3lTl7bhZjZ7L048eIA1y2gbpmhJ1y8/DBZ1CeQe6EqfNqMNRwMYPoctUDiBrhVl7MIAqqgKgpV04NRjeYahu9oO1EtPaPmFbsNecJxDHoqCcU7ng/DmAMEscZChgqVw2KNYj+EN4rTvj5QM3mu4Mfh80HiCq75eQBopf3GpSb54qUZ5A7Yeq8Ggw1XMwgulz1AKJGuJUXM4iCKiBqypXbAfUKmbFp3UOVAAAAAElFTkSuQmCC",
        ],
      },
      appearanceNames: {
        idle: "Surface1",
        1483692615578: "Surface2",
        1483692635012: "Deep",
      },
    },
    variables: {},
  },
  1483692683990: {
    id: "1483692683990",
    name: "Dirt\n\n",
    rules: [],
    spritesheet: {
      appearances: {
        idle: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAABT0lEQVRYR+2YwQ3CMAxF6WQswBDs0AVYgE04ckdMVpRKjtw2iX/sxgRUriTO49v+cRhu19N0voyn2s/7ed9s0cRJnctjD6/HONGi1KE58BxMTYxUbB43xJoBrUFr1UfWB9AIGDb0BhkBqQa7BaQabA1IiiDpDWuoFt1qsBaQIH8D0KNJ1gpSCkulFdYMXk3CgRC4mGIvQGoOFO5rgGgXdw8YbcY7xaiC5qtOmlysxr8ArA0mFbr0PaKi6SZBbwWryrMP9jpuuV91SFrXaw4FNarxPYeCbgq2esFJPwBKcc7z9jBjMyBqyNJB2u8hBbXB99jnOlFrgA9AjWobo+51YF0MC9pnZ2mcqp0xc/90mcatkg3t4ZPNbYYrrFG0OeD6LcxLCVHYDTAFita9qQatNiLt/3+jLjVByoJyjZJbu1FQeiamUhIORedF1Dd5A30AM91W0hQ4j6EAAAAASUVORK5CYII=",
        ],
        1483692702012: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAABUUlEQVRYR+2Yyw3CMAyG28lYgCHYoQuwAJtw5I6YrChIrlzHj6S1aleix2KHL78dO/U47Hjut2G+XCdxhc/rMWi/S47FD56xh+/9nGawx4twawCYZUd96YaaALFSvX/YIwAHawL2qLYHRoqCCghwR6qGQUu4TcAouAKqAkar1wQYqZ4KmEE9EzBaPVdArlt4bJA9JF7hpdBbgEXALYt5F2kxxEXBtIDQc9MCeuWfV7irHMwU3ioHs4X3fIDZ8q9SMDL/tM+D330wUj3ccbjytgBmqX20RKUGXOpgZP5pRd0N0OPmon7VeStoJX5rK1wpWJyyHZQFMGObWxXqP2Br0hG78+Sg9yneKFjl5lYHvYDE8VvU/M/a2OrKT8e5WWoiO37jZs8RwOZ8sISAU9arlXWF2DLGF1toi9aEH9bsnd1ge3NG3QJObfBcm+vxUgS491/yDgvM4svSEgAAAABJRU5ErkJggg==",
        ],
      },
      appearanceNames: {
        idle: "Idle",
        1483692702012: "Corner\n\n",
      },
    },
    variables: {},
  },
};

export default InitialCharacters;
