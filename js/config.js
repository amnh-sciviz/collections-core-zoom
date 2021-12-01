var config = {
  zoomDuration: 2000, // duration of zoom in/out in milliseconds
  packPadding: 12, // padding between circles
  auto: false, // setting this to anything other than false will automatically zoom in and out in a loop
  here: "trilobites", // set this to the mediaArray key (defined in the list below) associated with the current media array
  hereColor: "#9a3044",
  colorPalette: ["#74d7ca", "#51b7c4", "#ffffff", "#dddddd"], // color palette starting from largest circle to the smallest circle
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
          {"name": "EPS/Mineralogy", "value": 126527, "image": "img/Fossil_Plants.png"},
          {"name": "EPS/Meteorites", "value": 5294, "image": "img/Fossil_Fish.png"},
          {"name": "Tektites", "value": 921, "image": "img/Fossil_Fish.png"},
          {"name": "EPS/Mineral Deposits", "value": 13441, "image": "img/Fossil_Fish.png"},
          {"name": "EPS/Petrology", "value": 24603, "image": "img/Fossil_Plants.png"},
          {"name": "Astro/Observations", "value": 45, "unit": "TB", "image": "img/Fossil_Fish.png"},
          {"name": "Astro/Simulations", "value": 50, "unit": "TB", "image": "img/Fossil_Fish.png"},
          {"name": "Astro/Instruments", "value": 2, "image": "img/Fossil_Plants.png"}
        ]
      },{
        "name": "Anthropology",
        "children": [
          {"name": "Archaeology", "value": 340641, "image": "img/Fossil_Mammals.png"},
          {"name": "Ethnology", "value": 169893, "image": "img/Fossil_Plants.png"},
          {"name": "Biology", "value": 23009, "image": "img/Fossil_Fish.png"},
          {"name": "Other (casts, molds)", "value": 7215, "image": "img/Fossil_Plants.png"}
        ]
      },{
        "name": "Vertebrate Zoology",
        "children": [
          {"name": "Herpetology", "value": 376154, "image": "img/Fossil_Fish.png"},
          {"name": "Ichthyology", "value": 3231638, "image": "img/Fossil_Plants.png"},
          {"name": "Mammalogy", "value": 279812, "image": "img/Fossil_Mammals.png"},
          {"name": "Ornithology", "value": 890540, "image": "img/Fossil_Plants.png"}
        ]
      },{
        "name": "Paleontology",
        "children": [
          {"name": "Fossil Amphibians, Reptiles and Birds", "value": 33231, "image": "img/Fossil_Amphibians_Reptiles_and_Birds.png"},
          {"name": "Fossil Fish", "value": 28687, "image": "img/Fossil_Fish.png"},
          {"name": "Fossil Invertebrates", "value": 5110000, "image": "img/Fossil_Invertebrates.png"},
          {"name": "Fossil Mammals", "value": 400000, "image": "img/Fossil_Mammals.png"},
          {"name": "Fossil Plants", "value": 440, "image": "img/Fossil_Plants.png"}
        ]
      },{
        "name": "Invertebrate Zoology",
        "children": [
          {"name": "Amber", "value": 12744, "image": "img/Fossil_Fish.png"},
          {"name": "Arachnida", "value": 1216768, "image": "img/Fossil_Mammals.png"},
          {"name": "Cnidaria", "value": 8826, "image": "img/Fossil_Plants.png"},
          {"name": "Coleoptera", "value": 1982780, "image": "img/Fossil_Plants.png"},
          {"name": "Crustacea", "value": 116500, "image": "img/Fossil_Amphibians_Reptiles_and_Birds.png"},
          {"name": "Diptera", "value": 1138717, "image": "img/Fossil_Plants.png"},
          {"name": "Hemiptera", "value": 976518, "image": "img/Fossil_Mammals.png"},
          {"name": "Hymenoptera", "value": 8724094, "image": "img/Fossil_Fish.png"},
          {"name": "Isoptera", "value": 1000000, "image": "img/Fossil_Plants.png"},
          {"name": "Lepidoptera", "value": 2263456, "image": "img/Fossil_Amphibians_Reptiles_and_Birds.png"},
          {"name": "Minor Orders", "value": 824644, "image": "img/Fossil_Plants.png"},
          {"name": "Misc. Bulk", "value": 33597, "image": "img/Fossil_Mammals.png"},
          {"name": "Mollusca", "value": 1606459, "image": "img/Fossil_Fish.png"},
          {"name": "Myriapoda", "value": 79880},
          {"name": "Other Invert Phyla", "value": 3399856, "image": "img/Fossil_Amphibians_Reptiles_and_Birds.png"},
          {"name": "Protists", "value": 47895, "image": "img/Fossil_Plants.png"}
        ]
      }
    ]
  }
};
