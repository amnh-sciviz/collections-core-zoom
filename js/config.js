var config = {
  zoomDuration: 2000, // duration of zoom in/out in milliseconds
  packPadding: 12, // padding between circles
  auto: false, // setting this to anything other than false will automatically zoom in and out in a loop
  here: "trilobites", // set this to the mediaArray key (defined in the list below) associated with the current media array
  hereColor: "#9a3044",
  mediaArrays: {
    "trilobites": {"name": "Trilobites", "parent": "Fossil Invertebrates", "image": "img/Trilobite_Layout_01.jpg"}
  },
  data: {
    "name": "AMNH Collections",
    "children": [
      {
        "name": "Monell Cryo-Facility",
        "value": 126219
      },{
        "name": "Earth and Planetary Sciences",
        "children": [
          {"name": "EPS/Mineralogy", "value": 126527},
          {"name": "EPS/Meteorites", "value": 5294},
          {"name": "Tektites", "value": 921},
          {"name": "EPS/Mineral Deposits", "value": 13441},
          {"name": "EPS/Petrology", "value": 24603},
          {"name": "Astro/Observations", "value": 45, "unit": "TB"},
          {"name": "Astro/Simulations", "value": 50, "unit": "TB"},
          {"name": "Astro/Instruments", "value": 2}
        ]
      },{
        "name": "Anthropology",
        "children": [
          {"name": "Archaeology", "value": 340641},
          {"name": "Ethnology", "value": 169893},
          {"name": "Biology", "value": 23009},
          {"name": "Other (casts, molds)", "value": 7215}
        ]
      },{
        "name": "Vertebrate Zoology",
        "children": [
          {"name": "Herpetology", "value": 376154},
          {"name": "Ichthyology", "value": 3231638},
          {"name": "Mammalogy", "value": 279812},
          {"name": "Ornithology", "value": 890540}
        ]
      },{
        "name": "Paleontology",
        "children": [
          {"name": "Fossil Amphibians, Reptiles and Birds", "value": 33231},
          {"name": "Fossil Fish", "value": 28687},
          {"name": "Fossil Invertebrates", "value": 5110000},
          {"name": "Fossil Mammals", "value": 400000},
          {"name": "Fossil Plants", "value": 440}
        ]
      },{
        "name": "Invertebrate Zoology",
        "children": [
          {"name": "Amber", "value": 12744},
          {"name": "Arachnida", "value": 1216768},
          {"name": "Cnidaria", "value": 8826},
          {"name": "Coleoptera", "value": 1982780},
          {"name": "Crustacea", "value": 116500},
          {"name": "Diptera", "value": 1138717},
          {"name": "Hemiptera", "value": 976518},
          {"name": "Hymenoptera", "value": 8724094},
          {"name": "Isoptera", "value": 1000000},
          {"name": "Lepidoptera", "value": 2263456},
          {"name": "Minor Orders", "value": 824644},
          {"name": "Misc. Bulk", "value": 33597},
          {"name": "Mollusca", "value": 1606459},
          {"name": "Myriapoda", "value": 79880},
          {"name": "Other Invert Phyla", "value": 3399856},
          {"name": "Protists", "value": 47895}
        ]
      }
    ]
  }
};
