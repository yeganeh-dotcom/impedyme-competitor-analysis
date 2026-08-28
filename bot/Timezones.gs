/**
 * Timezones.gs - country -> IANA timezone lookup for the bot.
 *
 * GENERATED FILE - do not edit by hand.
 * Regenerate with: python3 bot/tools/generate_timezones.py > bot/Timezones.gs
 * Source: IANA tz database (iso3166.tab + zone.tab), public domain.
 * Generated for year 2026, 247 countries/territories.
 */

// code -> { name, tz, city, std, dst, zones, regions }
//   tz      primary IANA zone (tzdata lists the most populous zone first)
//   city    the label a phone/PC clock picker actually shows
//   std     standard-time offset in minutes from UTC
//   dst     summer-time offset in minutes, or null if the country has no DST
//   zones   every IANA zone in the country
//   regions tzdata's description of each extra zone (multi-zone countries only)
const COUNTRY_TIMEZONES = {
  "AD": {
    "name": "Andorra",
    "tz": "Europe/Andorra",
    "city": "Andorra",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Andorra"
    ],
    "regions": []
  },
  "AE": {
    "name": "United Arab Emirates",
    "tz": "Asia/Dubai",
    "city": "Dubai",
    "std": 240,
    "dst": null,
    "zones": [
      "Asia/Dubai"
    ],
    "regions": []
  },
  "AF": {
    "name": "Afghanistan",
    "tz": "Asia/Kabul",
    "city": "Kabul",
    "std": 270,
    "dst": null,
    "zones": [
      "Asia/Kabul"
    ],
    "regions": []
  },
  "AG": {
    "name": "Antigua & Barbuda",
    "tz": "America/Antigua",
    "city": "Antigua",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Antigua"
    ],
    "regions": []
  },
  "AI": {
    "name": "Anguilla",
    "tz": "America/Anguilla",
    "city": "Anguilla",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Anguilla"
    ],
    "regions": []
  },
  "AL": {
    "name": "Albania",
    "tz": "Europe/Tirane",
    "city": "Tirane",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Tirane"
    ],
    "regions": []
  },
  "AM": {
    "name": "Armenia",
    "tz": "Asia/Yerevan",
    "city": "Yerevan",
    "std": 240,
    "dst": null,
    "zones": [
      "Asia/Yerevan"
    ],
    "regions": []
  },
  "AO": {
    "name": "Angola",
    "tz": "Africa/Luanda",
    "city": "Luanda",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Luanda"
    ],
    "regions": []
  },
  "AQ": {
    "name": "Antarctica",
    "tz": "Antarctica/McMurdo",
    "city": "McMurdo",
    "std": 720,
    "dst": 780,
    "zones": [
      "Antarctica/McMurdo",
      "Antarctica/Casey",
      "Antarctica/Davis",
      "Antarctica/DumontDUrville",
      "Antarctica/Mawson",
      "Antarctica/Palmer",
      "Antarctica/Rothera",
      "Antarctica/Syowa",
      "Antarctica/Troll",
      "Antarctica/Vostok"
    ],
    "regions": [
      "New Zealand time - McMurdo, South Pole",
      "Casey",
      "Davis",
      "Dumont-d'Urville",
      "Mawson",
      "Palmer",
      "Rothera",
      "Syowa",
      "Troll",
      "Vostok"
    ]
  },
  "AR": {
    "name": "Argentina",
    "tz": "America/Argentina/Buenos_Aires",
    "city": "Buenos Aires",
    "std": -180,
    "dst": null,
    "zones": [
      "America/Argentina/Buenos_Aires",
      "America/Argentina/Cordoba",
      "America/Argentina/Salta",
      "America/Argentina/Jujuy",
      "America/Argentina/Tucuman",
      "America/Argentina/Catamarca",
      "America/Argentina/La_Rioja",
      "America/Argentina/San_Juan",
      "America/Argentina/Mendoza",
      "America/Argentina/San_Luis",
      "America/Argentina/Rio_Gallegos",
      "America/Argentina/Ushuaia"
    ],
    "regions": [
      "Buenos Aires (BA, CF)",
      "Argentina (most areas: CB, CC, CN, ER, FM, MN, SE, SF)",
      "Salta (SA, LP, NQ, RN)",
      "Jujuy (JY)",
      "Tucuman (TM)",
      "Catamarca (CT), Chubut (CH)",
      "La Rioja (LR)",
      "San Juan (SJ)",
      "Mendoza (MZ)",
      "San Luis (SL)",
      "Santa Cruz (SC)",
      "Tierra del Fuego (TF)"
    ]
  },
  "AS": {
    "name": "Samoa (American)",
    "tz": "Pacific/Pago_Pago",
    "city": "Pago Pago",
    "std": -660,
    "dst": null,
    "zones": [
      "Pacific/Pago_Pago"
    ],
    "regions": []
  },
  "AT": {
    "name": "Austria",
    "tz": "Europe/Vienna",
    "city": "Vienna",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Vienna"
    ],
    "regions": []
  },
  "AU": {
    "name": "Australia",
    "tz": "Australia/Sydney",
    "city": "Sydney",
    "std": 600,
    "dst": 660,
    "zones": [
      "Australia/Lord_Howe",
      "Antarctica/Macquarie",
      "Australia/Hobart",
      "Australia/Melbourne",
      "Australia/Sydney",
      "Australia/Broken_Hill",
      "Australia/Brisbane",
      "Australia/Lindeman",
      "Australia/Adelaide",
      "Australia/Darwin",
      "Australia/Perth",
      "Australia/Eucla"
    ],
    "regions": [
      "Lord Howe Island",
      "Macquarie Island",
      "Tasmania",
      "Victoria",
      "New South Wales (most areas)",
      "New South Wales (Yancowinna)",
      "Queensland (most areas)",
      "Queensland (Whitsunday Islands)",
      "South Australia",
      "Northern Territory",
      "Western Australia (most areas)",
      "Western Australia (Eucla)"
    ]
  },
  "AW": {
    "name": "Aruba",
    "tz": "America/Aruba",
    "city": "Aruba",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Aruba"
    ],
    "regions": []
  },
  "AX": {
    "name": "Åland Islands",
    "tz": "Europe/Mariehamn",
    "city": "Mariehamn",
    "std": 120,
    "dst": 180,
    "zones": [
      "Europe/Mariehamn"
    ],
    "regions": []
  },
  "AZ": {
    "name": "Azerbaijan",
    "tz": "Asia/Baku",
    "city": "Baku",
    "std": 240,
    "dst": null,
    "zones": [
      "Asia/Baku"
    ],
    "regions": []
  },
  "BA": {
    "name": "Bosnia & Herzegovina",
    "tz": "Europe/Sarajevo",
    "city": "Sarajevo",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Sarajevo"
    ],
    "regions": []
  },
  "BB": {
    "name": "Barbados",
    "tz": "America/Barbados",
    "city": "Barbados",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Barbados"
    ],
    "regions": []
  },
  "BD": {
    "name": "Bangladesh",
    "tz": "Asia/Dhaka",
    "city": "Dhaka",
    "std": 360,
    "dst": null,
    "zones": [
      "Asia/Dhaka"
    ],
    "regions": []
  },
  "BE": {
    "name": "Belgium",
    "tz": "Europe/Brussels",
    "city": "Brussels",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Brussels"
    ],
    "regions": []
  },
  "BF": {
    "name": "Burkina Faso",
    "tz": "Africa/Ouagadougou",
    "city": "Ouagadougou",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Ouagadougou"
    ],
    "regions": []
  },
  "BG": {
    "name": "Bulgaria",
    "tz": "Europe/Sofia",
    "city": "Sofia",
    "std": 120,
    "dst": 180,
    "zones": [
      "Europe/Sofia"
    ],
    "regions": []
  },
  "BH": {
    "name": "Bahrain",
    "tz": "Asia/Bahrain",
    "city": "Bahrain",
    "std": 180,
    "dst": null,
    "zones": [
      "Asia/Bahrain"
    ],
    "regions": []
  },
  "BI": {
    "name": "Burundi",
    "tz": "Africa/Bujumbura",
    "city": "Bujumbura",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Bujumbura"
    ],
    "regions": []
  },
  "BJ": {
    "name": "Benin",
    "tz": "Africa/Porto-Novo",
    "city": "Porto-Novo",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Porto-Novo"
    ],
    "regions": []
  },
  "BL": {
    "name": "St Barthelemy",
    "tz": "America/St_Barthelemy",
    "city": "St Barthelemy",
    "std": -240,
    "dst": null,
    "zones": [
      "America/St_Barthelemy"
    ],
    "regions": []
  },
  "BM": {
    "name": "Bermuda",
    "tz": "Atlantic/Bermuda",
    "city": "Bermuda",
    "std": -240,
    "dst": -180,
    "zones": [
      "Atlantic/Bermuda"
    ],
    "regions": []
  },
  "BN": {
    "name": "Brunei",
    "tz": "Asia/Brunei",
    "city": "Brunei",
    "std": 480,
    "dst": null,
    "zones": [
      "Asia/Brunei"
    ],
    "regions": []
  },
  "BO": {
    "name": "Bolivia",
    "tz": "America/La_Paz",
    "city": "La Paz",
    "std": -240,
    "dst": null,
    "zones": [
      "America/La_Paz"
    ],
    "regions": []
  },
  "BQ": {
    "name": "Caribbean NL",
    "tz": "America/Kralendijk",
    "city": "Kralendijk",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Kralendijk"
    ],
    "regions": []
  },
  "BR": {
    "name": "Brazil",
    "tz": "America/Sao_Paulo",
    "city": "Sao Paulo",
    "std": -180,
    "dst": null,
    "zones": [
      "America/Noronha",
      "America/Belem",
      "America/Fortaleza",
      "America/Recife",
      "America/Araguaina",
      "America/Maceio",
      "America/Bahia",
      "America/Sao_Paulo",
      "America/Campo_Grande",
      "America/Cuiaba",
      "America/Santarem",
      "America/Porto_Velho",
      "America/Boa_Vista",
      "America/Manaus",
      "America/Eirunepe",
      "America/Rio_Branco"
    ],
    "regions": [
      "Atlantic islands",
      "Para (east), Amapa",
      "Brazil (northeast: MA, PI, CE, RN, PB)",
      "Pernambuco",
      "Tocantins",
      "Alagoas, Sergipe",
      "Bahia",
      "Brazil (southeast: GO, DF, MG, ES, RJ, SP, PR, SC, RS)",
      "Mato Grosso do Sul",
      "Mato Grosso",
      "Para (west)",
      "Rondonia",
      "Roraima",
      "Amazonas (east)",
      "Amazonas (west)",
      "Acre"
    ]
  },
  "BS": {
    "name": "Bahamas",
    "tz": "America/Nassau",
    "city": "Nassau",
    "std": -300,
    "dst": -240,
    "zones": [
      "America/Nassau"
    ],
    "regions": []
  },
  "BT": {
    "name": "Bhutan",
    "tz": "Asia/Thimphu",
    "city": "Thimphu",
    "std": 360,
    "dst": null,
    "zones": [
      "Asia/Thimphu"
    ],
    "regions": []
  },
  "BW": {
    "name": "Botswana",
    "tz": "Africa/Gaborone",
    "city": "Gaborone",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Gaborone"
    ],
    "regions": []
  },
  "BY": {
    "name": "Belarus",
    "tz": "Europe/Minsk",
    "city": "Minsk",
    "std": 180,
    "dst": null,
    "zones": [
      "Europe/Minsk"
    ],
    "regions": []
  },
  "BZ": {
    "name": "Belize",
    "tz": "America/Belize",
    "city": "Belize",
    "std": -360,
    "dst": null,
    "zones": [
      "America/Belize"
    ],
    "regions": []
  },
  "CA": {
    "name": "Canada",
    "tz": "America/Toronto",
    "city": "Toronto",
    "std": -300,
    "dst": -240,
    "zones": [
      "America/St_Johns",
      "America/Halifax",
      "America/Glace_Bay",
      "America/Moncton",
      "America/Goose_Bay",
      "America/Blanc-Sablon",
      "America/Toronto",
      "America/Iqaluit",
      "America/Atikokan",
      "America/Winnipeg",
      "America/Resolute",
      "America/Rankin_Inlet",
      "America/Regina",
      "America/Swift_Current",
      "America/Edmonton",
      "America/Cambridge_Bay",
      "America/Inuvik",
      "America/Creston",
      "America/Dawson_Creek",
      "America/Fort_Nelson",
      "America/Whitehorse",
      "America/Dawson",
      "America/Vancouver"
    ],
    "regions": [
      "Newfoundland, Labrador (SE)",
      "Atlantic - NS (most areas), PE",
      "Atlantic - NS (Cape Breton)",
      "Atlantic - New Brunswick",
      "Atlantic - Labrador (most areas)",
      "AST - QC (Lower North Shore)",
      "Eastern - ON & QC (most areas)",
      "Eastern - NU (most areas)",
      "EST - ON (Atikokan), NU (Coral H)",
      "Central - ON (west), Manitoba",
      "Central - NU (Resolute)",
      "Central - NU (central)",
      "CST - SK (most areas)",
      "CST - SK (midwest)",
      "Mountain - AB, BC(E), NT(E), SK(W)",
      "Mountain - NU (west)",
      "Mountain - NT (west)",
      "MST - BC (Creston)",
      "MST - BC (Dawson Cr, Ft St John)",
      "MST - BC (Ft Nelson)",
      "MST - Yukon (east)",
      "MST - Yukon (west)",
      "Pacific - BC (most areas)"
    ]
  },
  "CC": {
    "name": "Cocos (Keeling) Islands",
    "tz": "Indian/Cocos",
    "city": "Cocos",
    "std": 390,
    "dst": null,
    "zones": [
      "Indian/Cocos"
    ],
    "regions": []
  },
  "CD": {
    "name": "Congo (Dem. Rep.)",
    "tz": "Africa/Kinshasa",
    "city": "Kinshasa",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Kinshasa",
      "Africa/Lubumbashi"
    ],
    "regions": [
      "Dem. Rep. of Congo (west)",
      "Dem. Rep. of Congo (east)"
    ]
  },
  "CF": {
    "name": "Central African Rep.",
    "tz": "Africa/Bangui",
    "city": "Bangui",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Bangui"
    ],
    "regions": []
  },
  "CG": {
    "name": "Congo (Rep.)",
    "tz": "Africa/Brazzaville",
    "city": "Brazzaville",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Brazzaville"
    ],
    "regions": []
  },
  "CH": {
    "name": "Switzerland",
    "tz": "Europe/Zurich",
    "city": "Zurich",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Zurich"
    ],
    "regions": []
  },
  "CI": {
    "name": "Côte d'Ivoire",
    "tz": "Africa/Abidjan",
    "city": "Abidjan",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Abidjan"
    ],
    "regions": []
  },
  "CK": {
    "name": "Cook Islands",
    "tz": "Pacific/Rarotonga",
    "city": "Rarotonga",
    "std": -600,
    "dst": null,
    "zones": [
      "Pacific/Rarotonga"
    ],
    "regions": []
  },
  "CL": {
    "name": "Chile",
    "tz": "America/Santiago",
    "city": "Santiago",
    "std": -240,
    "dst": -180,
    "zones": [
      "America/Santiago",
      "America/Coyhaique",
      "America/Punta_Arenas",
      "Pacific/Easter"
    ],
    "regions": [
      "most of Chile",
      "Aysen Region",
      "Magallanes Region",
      "Easter Island"
    ]
  },
  "CM": {
    "name": "Cameroon",
    "tz": "Africa/Douala",
    "city": "Douala",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Douala"
    ],
    "regions": []
  },
  "CN": {
    "name": "China",
    "tz": "Asia/Shanghai",
    "city": "Shanghai",
    "std": 480,
    "dst": null,
    "zones": [
      "Asia/Shanghai",
      "Asia/Urumqi"
    ],
    "regions": [
      "Beijing Time",
      "Xinjiang Time"
    ]
  },
  "CO": {
    "name": "Colombia",
    "tz": "America/Bogota",
    "city": "Bogota",
    "std": -300,
    "dst": null,
    "zones": [
      "America/Bogota"
    ],
    "regions": []
  },
  "CR": {
    "name": "Costa Rica",
    "tz": "America/Costa_Rica",
    "city": "Costa Rica",
    "std": -360,
    "dst": null,
    "zones": [
      "America/Costa_Rica"
    ],
    "regions": []
  },
  "CU": {
    "name": "Cuba",
    "tz": "America/Havana",
    "city": "Havana",
    "std": -300,
    "dst": -240,
    "zones": [
      "America/Havana"
    ],
    "regions": []
  },
  "CV": {
    "name": "Cape Verde",
    "tz": "Atlantic/Cape_Verde",
    "city": "Cape Verde",
    "std": -60,
    "dst": null,
    "zones": [
      "Atlantic/Cape_Verde"
    ],
    "regions": []
  },
  "CW": {
    "name": "Curaçao",
    "tz": "America/Curacao",
    "city": "Curacao",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Curacao"
    ],
    "regions": []
  },
  "CX": {
    "name": "Christmas Island",
    "tz": "Indian/Christmas",
    "city": "Christmas",
    "std": 420,
    "dst": null,
    "zones": [
      "Indian/Christmas"
    ],
    "regions": []
  },
  "CY": {
    "name": "Cyprus",
    "tz": "Asia/Nicosia",
    "city": "Nicosia",
    "std": 120,
    "dst": 180,
    "zones": [
      "Asia/Nicosia",
      "Asia/Famagusta"
    ],
    "regions": [
      "most of Cyprus",
      "Northern Cyprus"
    ]
  },
  "CZ": {
    "name": "Czech Republic",
    "tz": "Europe/Prague",
    "city": "Prague",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Prague"
    ],
    "regions": []
  },
  "DE": {
    "name": "Germany",
    "tz": "Europe/Berlin",
    "city": "Berlin",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Berlin",
      "Europe/Busingen"
    ],
    "regions": [
      "most of Germany",
      "Busingen"
    ]
  },
  "DJ": {
    "name": "Djibouti",
    "tz": "Africa/Djibouti",
    "city": "Djibouti",
    "std": 180,
    "dst": null,
    "zones": [
      "Africa/Djibouti"
    ],
    "regions": []
  },
  "DK": {
    "name": "Denmark",
    "tz": "Europe/Copenhagen",
    "city": "Copenhagen",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Copenhagen"
    ],
    "regions": []
  },
  "DM": {
    "name": "Dominica",
    "tz": "America/Dominica",
    "city": "Dominica",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Dominica"
    ],
    "regions": []
  },
  "DO": {
    "name": "Dominican Republic",
    "tz": "America/Santo_Domingo",
    "city": "Santo Domingo",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Santo_Domingo"
    ],
    "regions": []
  },
  "DZ": {
    "name": "Algeria",
    "tz": "Africa/Algiers",
    "city": "Algiers",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Algiers"
    ],
    "regions": []
  },
  "EC": {
    "name": "Ecuador",
    "tz": "America/Guayaquil",
    "city": "Guayaquil",
    "std": -300,
    "dst": null,
    "zones": [
      "America/Guayaquil",
      "Pacific/Galapagos"
    ],
    "regions": [
      "Ecuador (mainland)",
      "Galapagos Islands"
    ]
  },
  "EE": {
    "name": "Estonia",
    "tz": "Europe/Tallinn",
    "city": "Tallinn",
    "std": 120,
    "dst": 180,
    "zones": [
      "Europe/Tallinn"
    ],
    "regions": []
  },
  "EG": {
    "name": "Egypt",
    "tz": "Africa/Cairo",
    "city": "Cairo",
    "std": 120,
    "dst": 180,
    "zones": [
      "Africa/Cairo"
    ],
    "regions": []
  },
  "EH": {
    "name": "Western Sahara",
    "tz": "Africa/El_Aaiun",
    "city": "El Aaiun",
    "std": 0,
    "dst": 60,
    "zones": [
      "Africa/El_Aaiun"
    ],
    "regions": []
  },
  "ER": {
    "name": "Eritrea",
    "tz": "Africa/Asmara",
    "city": "Asmara",
    "std": 180,
    "dst": null,
    "zones": [
      "Africa/Asmara"
    ],
    "regions": []
  },
  "ES": {
    "name": "Spain",
    "tz": "Europe/Madrid",
    "city": "Madrid",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Madrid",
      "Africa/Ceuta",
      "Atlantic/Canary"
    ],
    "regions": [
      "Spain (mainland)",
      "Ceuta, Melilla",
      "Canary Islands"
    ]
  },
  "ET": {
    "name": "Ethiopia",
    "tz": "Africa/Addis_Ababa",
    "city": "Addis Ababa",
    "std": 180,
    "dst": null,
    "zones": [
      "Africa/Addis_Ababa"
    ],
    "regions": []
  },
  "FI": {
    "name": "Finland",
    "tz": "Europe/Helsinki",
    "city": "Helsinki",
    "std": 120,
    "dst": 180,
    "zones": [
      "Europe/Helsinki"
    ],
    "regions": []
  },
  "FJ": {
    "name": "Fiji",
    "tz": "Pacific/Fiji",
    "city": "Fiji",
    "std": 720,
    "dst": null,
    "zones": [
      "Pacific/Fiji"
    ],
    "regions": []
  },
  "FK": {
    "name": "Falkland Islands",
    "tz": "Atlantic/Stanley",
    "city": "Stanley",
    "std": -180,
    "dst": null,
    "zones": [
      "Atlantic/Stanley"
    ],
    "regions": []
  },
  "FM": {
    "name": "Micronesia",
    "tz": "Pacific/Pohnpei",
    "city": "Pohnpei",
    "std": 660,
    "dst": null,
    "zones": [
      "Pacific/Chuuk",
      "Pacific/Pohnpei",
      "Pacific/Kosrae"
    ],
    "regions": [
      "Chuuk/Truk, Yap",
      "Pohnpei/Ponape",
      "Kosrae"
    ]
  },
  "FO": {
    "name": "Faroe Islands",
    "tz": "Atlantic/Faroe",
    "city": "Faroe",
    "std": 0,
    "dst": 60,
    "zones": [
      "Atlantic/Faroe"
    ],
    "regions": []
  },
  "FR": {
    "name": "France",
    "tz": "Europe/Paris",
    "city": "Paris",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Paris"
    ],
    "regions": []
  },
  "GA": {
    "name": "Gabon",
    "tz": "Africa/Libreville",
    "city": "Libreville",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Libreville"
    ],
    "regions": []
  },
  "GB": {
    "name": "Britain (UK)",
    "tz": "Europe/London",
    "city": "London",
    "std": 0,
    "dst": 60,
    "zones": [
      "Europe/London"
    ],
    "regions": []
  },
  "GD": {
    "name": "Grenada",
    "tz": "America/Grenada",
    "city": "Grenada",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Grenada"
    ],
    "regions": []
  },
  "GE": {
    "name": "Georgia",
    "tz": "Asia/Tbilisi",
    "city": "Tbilisi",
    "std": 240,
    "dst": null,
    "zones": [
      "Asia/Tbilisi"
    ],
    "regions": []
  },
  "GF": {
    "name": "French Guiana",
    "tz": "America/Cayenne",
    "city": "Cayenne",
    "std": -180,
    "dst": null,
    "zones": [
      "America/Cayenne"
    ],
    "regions": []
  },
  "GG": {
    "name": "Guernsey",
    "tz": "Europe/Guernsey",
    "city": "Guernsey",
    "std": 0,
    "dst": 60,
    "zones": [
      "Europe/Guernsey"
    ],
    "regions": []
  },
  "GH": {
    "name": "Ghana",
    "tz": "Africa/Accra",
    "city": "Accra",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Accra"
    ],
    "regions": []
  },
  "GI": {
    "name": "Gibraltar",
    "tz": "Europe/Gibraltar",
    "city": "Gibraltar",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Gibraltar"
    ],
    "regions": []
  },
  "GL": {
    "name": "Greenland",
    "tz": "America/Nuuk",
    "city": "Nuuk",
    "std": -120,
    "dst": -60,
    "zones": [
      "America/Nuuk",
      "America/Danmarkshavn",
      "America/Scoresbysund",
      "America/Thule"
    ],
    "regions": [
      "most of Greenland",
      "National Park (east coast)",
      "Scoresbysund/Ittoqqortoormiit",
      "Thule/Pituffik"
    ]
  },
  "GM": {
    "name": "Gambia",
    "tz": "Africa/Banjul",
    "city": "Banjul",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Banjul"
    ],
    "regions": []
  },
  "GN": {
    "name": "Guinea",
    "tz": "Africa/Conakry",
    "city": "Conakry",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Conakry"
    ],
    "regions": []
  },
  "GP": {
    "name": "Guadeloupe",
    "tz": "America/Guadeloupe",
    "city": "Guadeloupe",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Guadeloupe"
    ],
    "regions": []
  },
  "GQ": {
    "name": "Equatorial Guinea",
    "tz": "Africa/Malabo",
    "city": "Malabo",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Malabo"
    ],
    "regions": []
  },
  "GR": {
    "name": "Greece",
    "tz": "Europe/Athens",
    "city": "Athens",
    "std": 120,
    "dst": 180,
    "zones": [
      "Europe/Athens"
    ],
    "regions": []
  },
  "GS": {
    "name": "South Georgia & the South Sandwich Islands",
    "tz": "Atlantic/South_Georgia",
    "city": "South Georgia",
    "std": -120,
    "dst": null,
    "zones": [
      "Atlantic/South_Georgia"
    ],
    "regions": []
  },
  "GT": {
    "name": "Guatemala",
    "tz": "America/Guatemala",
    "city": "Guatemala",
    "std": -360,
    "dst": null,
    "zones": [
      "America/Guatemala"
    ],
    "regions": []
  },
  "GU": {
    "name": "Guam",
    "tz": "Pacific/Guam",
    "city": "Guam",
    "std": 600,
    "dst": null,
    "zones": [
      "Pacific/Guam"
    ],
    "regions": []
  },
  "GW": {
    "name": "Guinea-Bissau",
    "tz": "Africa/Bissau",
    "city": "Bissau",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Bissau"
    ],
    "regions": []
  },
  "GY": {
    "name": "Guyana",
    "tz": "America/Guyana",
    "city": "Guyana",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Guyana"
    ],
    "regions": []
  },
  "HK": {
    "name": "Hong Kong",
    "tz": "Asia/Hong_Kong",
    "city": "Hong Kong",
    "std": 480,
    "dst": null,
    "zones": [
      "Asia/Hong_Kong"
    ],
    "regions": []
  },
  "HN": {
    "name": "Honduras",
    "tz": "America/Tegucigalpa",
    "city": "Tegucigalpa",
    "std": -360,
    "dst": null,
    "zones": [
      "America/Tegucigalpa"
    ],
    "regions": []
  },
  "HR": {
    "name": "Croatia",
    "tz": "Europe/Zagreb",
    "city": "Zagreb",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Zagreb"
    ],
    "regions": []
  },
  "HT": {
    "name": "Haiti",
    "tz": "America/Port-au-Prince",
    "city": "Port-au-Prince",
    "std": -300,
    "dst": -240,
    "zones": [
      "America/Port-au-Prince"
    ],
    "regions": []
  },
  "HU": {
    "name": "Hungary",
    "tz": "Europe/Budapest",
    "city": "Budapest",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Budapest"
    ],
    "regions": []
  },
  "ID": {
    "name": "Indonesia",
    "tz": "Asia/Jakarta",
    "city": "Jakarta",
    "std": 420,
    "dst": null,
    "zones": [
      "Asia/Jakarta",
      "Asia/Pontianak",
      "Asia/Makassar",
      "Asia/Jayapura"
    ],
    "regions": [
      "Java, Sumatra",
      "Borneo (west, central)",
      "Borneo (east, south), Sulawesi/Celebes, Bali, Nusa Tengarra, Timor (west)",
      "New Guinea (West Papua / Irian Jaya), Malukus/Moluccas"
    ]
  },
  "IE": {
    "name": "Ireland",
    "tz": "Europe/Dublin",
    "city": "Dublin",
    "std": 0,
    "dst": 60,
    "zones": [
      "Europe/Dublin"
    ],
    "regions": []
  },
  "IL": {
    "name": "Israel",
    "tz": "Asia/Jerusalem",
    "city": "Jerusalem",
    "std": 120,
    "dst": 180,
    "zones": [
      "Asia/Jerusalem"
    ],
    "regions": []
  },
  "IM": {
    "name": "Isle of Man",
    "tz": "Europe/Isle_of_Man",
    "city": "Isle of Man",
    "std": 0,
    "dst": 60,
    "zones": [
      "Europe/Isle_of_Man"
    ],
    "regions": []
  },
  "IN": {
    "name": "India",
    "tz": "Asia/Kolkata",
    "city": "Kolkata",
    "std": 330,
    "dst": null,
    "zones": [
      "Asia/Kolkata"
    ],
    "regions": []
  },
  "IO": {
    "name": "British Indian Ocean Territory",
    "tz": "Indian/Chagos",
    "city": "Chagos",
    "std": 360,
    "dst": null,
    "zones": [
      "Indian/Chagos"
    ],
    "regions": []
  },
  "IQ": {
    "name": "Iraq",
    "tz": "Asia/Baghdad",
    "city": "Baghdad",
    "std": 180,
    "dst": null,
    "zones": [
      "Asia/Baghdad"
    ],
    "regions": []
  },
  "IR": {
    "name": "Iran",
    "tz": "Asia/Tehran",
    "city": "Tehran",
    "std": 210,
    "dst": null,
    "zones": [
      "Asia/Tehran"
    ],
    "regions": []
  },
  "IS": {
    "name": "Iceland",
    "tz": "Atlantic/Reykjavik",
    "city": "Reykjavik",
    "std": 0,
    "dst": null,
    "zones": [
      "Atlantic/Reykjavik"
    ],
    "regions": []
  },
  "IT": {
    "name": "Italy",
    "tz": "Europe/Rome",
    "city": "Rome",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Rome"
    ],
    "regions": []
  },
  "JE": {
    "name": "Jersey",
    "tz": "Europe/Jersey",
    "city": "Jersey",
    "std": 0,
    "dst": 60,
    "zones": [
      "Europe/Jersey"
    ],
    "regions": []
  },
  "JM": {
    "name": "Jamaica",
    "tz": "America/Jamaica",
    "city": "Jamaica",
    "std": -300,
    "dst": null,
    "zones": [
      "America/Jamaica"
    ],
    "regions": []
  },
  "JO": {
    "name": "Jordan",
    "tz": "Asia/Amman",
    "city": "Amman",
    "std": 180,
    "dst": null,
    "zones": [
      "Asia/Amman"
    ],
    "regions": []
  },
  "JP": {
    "name": "Japan",
    "tz": "Asia/Tokyo",
    "city": "Tokyo",
    "std": 540,
    "dst": null,
    "zones": [
      "Asia/Tokyo"
    ],
    "regions": []
  },
  "KE": {
    "name": "Kenya",
    "tz": "Africa/Nairobi",
    "city": "Nairobi",
    "std": 180,
    "dst": null,
    "zones": [
      "Africa/Nairobi"
    ],
    "regions": []
  },
  "KG": {
    "name": "Kyrgyzstan",
    "tz": "Asia/Bishkek",
    "city": "Bishkek",
    "std": 360,
    "dst": null,
    "zones": [
      "Asia/Bishkek"
    ],
    "regions": []
  },
  "KH": {
    "name": "Cambodia",
    "tz": "Asia/Phnom_Penh",
    "city": "Phnom Penh",
    "std": 420,
    "dst": null,
    "zones": [
      "Asia/Phnom_Penh"
    ],
    "regions": []
  },
  "KI": {
    "name": "Kiribati",
    "tz": "Pacific/Tarawa",
    "city": "Tarawa",
    "std": 720,
    "dst": null,
    "zones": [
      "Pacific/Tarawa",
      "Pacific/Kanton",
      "Pacific/Kiritimati"
    ],
    "regions": [
      "Gilbert Islands",
      "Phoenix Islands",
      "Line Islands"
    ]
  },
  "KM": {
    "name": "Comoros",
    "tz": "Indian/Comoro",
    "city": "Comoro",
    "std": 180,
    "dst": null,
    "zones": [
      "Indian/Comoro"
    ],
    "regions": []
  },
  "KN": {
    "name": "St Kitts & Nevis",
    "tz": "America/St_Kitts",
    "city": "St Kitts",
    "std": -240,
    "dst": null,
    "zones": [
      "America/St_Kitts"
    ],
    "regions": []
  },
  "KP": {
    "name": "Korea (North)",
    "tz": "Asia/Pyongyang",
    "city": "Pyongyang",
    "std": 540,
    "dst": null,
    "zones": [
      "Asia/Pyongyang"
    ],
    "regions": []
  },
  "KR": {
    "name": "Korea (South)",
    "tz": "Asia/Seoul",
    "city": "Seoul",
    "std": 540,
    "dst": null,
    "zones": [
      "Asia/Seoul"
    ],
    "regions": []
  },
  "KW": {
    "name": "Kuwait",
    "tz": "Asia/Kuwait",
    "city": "Kuwait",
    "std": 180,
    "dst": null,
    "zones": [
      "Asia/Kuwait"
    ],
    "regions": []
  },
  "KY": {
    "name": "Cayman Islands",
    "tz": "America/Cayman",
    "city": "Cayman",
    "std": -300,
    "dst": null,
    "zones": [
      "America/Cayman"
    ],
    "regions": []
  },
  "KZ": {
    "name": "Kazakhstan",
    "tz": "Asia/Almaty",
    "city": "Almaty",
    "std": 300,
    "dst": null,
    "zones": [
      "Asia/Almaty",
      "Asia/Qyzylorda",
      "Asia/Qostanay",
      "Asia/Aqtobe",
      "Asia/Aqtau",
      "Asia/Atyrau",
      "Asia/Oral"
    ],
    "regions": [
      "most of Kazakhstan",
      "Qyzylorda/Kyzylorda/Kzyl-Orda",
      "Qostanay/Kostanay/Kustanay",
      "Aqtobe/Aktobe",
      "Mangghystau/Mankistau",
      "Atyrau/Atirau/Gur'yev",
      "West Kazakhstan"
    ]
  },
  "LA": {
    "name": "Laos",
    "tz": "Asia/Vientiane",
    "city": "Vientiane",
    "std": 420,
    "dst": null,
    "zones": [
      "Asia/Vientiane"
    ],
    "regions": []
  },
  "LB": {
    "name": "Lebanon",
    "tz": "Asia/Beirut",
    "city": "Beirut",
    "std": 120,
    "dst": 180,
    "zones": [
      "Asia/Beirut"
    ],
    "regions": []
  },
  "LC": {
    "name": "St Lucia",
    "tz": "America/St_Lucia",
    "city": "St Lucia",
    "std": -240,
    "dst": null,
    "zones": [
      "America/St_Lucia"
    ],
    "regions": []
  },
  "LI": {
    "name": "Liechtenstein",
    "tz": "Europe/Vaduz",
    "city": "Vaduz",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Vaduz"
    ],
    "regions": []
  },
  "LK": {
    "name": "Sri Lanka",
    "tz": "Asia/Colombo",
    "city": "Colombo",
    "std": 330,
    "dst": null,
    "zones": [
      "Asia/Colombo"
    ],
    "regions": []
  },
  "LR": {
    "name": "Liberia",
    "tz": "Africa/Monrovia",
    "city": "Monrovia",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Monrovia"
    ],
    "regions": []
  },
  "LS": {
    "name": "Lesotho",
    "tz": "Africa/Maseru",
    "city": "Maseru",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Maseru"
    ],
    "regions": []
  },
  "LT": {
    "name": "Lithuania",
    "tz": "Europe/Vilnius",
    "city": "Vilnius",
    "std": 120,
    "dst": 180,
    "zones": [
      "Europe/Vilnius"
    ],
    "regions": []
  },
  "LU": {
    "name": "Luxembourg",
    "tz": "Europe/Luxembourg",
    "city": "Luxembourg",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Luxembourg"
    ],
    "regions": []
  },
  "LV": {
    "name": "Latvia",
    "tz": "Europe/Riga",
    "city": "Riga",
    "std": 120,
    "dst": 180,
    "zones": [
      "Europe/Riga"
    ],
    "regions": []
  },
  "LY": {
    "name": "Libya",
    "tz": "Africa/Tripoli",
    "city": "Tripoli",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Tripoli"
    ],
    "regions": []
  },
  "MA": {
    "name": "Morocco",
    "tz": "Africa/Casablanca",
    "city": "Casablanca",
    "std": 0,
    "dst": 60,
    "zones": [
      "Africa/Casablanca"
    ],
    "regions": []
  },
  "MC": {
    "name": "Monaco",
    "tz": "Europe/Monaco",
    "city": "Monaco",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Monaco"
    ],
    "regions": []
  },
  "MD": {
    "name": "Moldova",
    "tz": "Europe/Chisinau",
    "city": "Chisinau",
    "std": 120,
    "dst": 180,
    "zones": [
      "Europe/Chisinau"
    ],
    "regions": []
  },
  "ME": {
    "name": "Montenegro",
    "tz": "Europe/Podgorica",
    "city": "Podgorica",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Podgorica"
    ],
    "regions": []
  },
  "MF": {
    "name": "St Martin (French)",
    "tz": "America/Marigot",
    "city": "Marigot",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Marigot"
    ],
    "regions": []
  },
  "MG": {
    "name": "Madagascar",
    "tz": "Indian/Antananarivo",
    "city": "Antananarivo",
    "std": 180,
    "dst": null,
    "zones": [
      "Indian/Antananarivo"
    ],
    "regions": []
  },
  "MH": {
    "name": "Marshall Islands",
    "tz": "Pacific/Majuro",
    "city": "Majuro",
    "std": 720,
    "dst": null,
    "zones": [
      "Pacific/Majuro",
      "Pacific/Kwajalein"
    ],
    "regions": [
      "most of Marshall Islands",
      "Kwajalein"
    ]
  },
  "MK": {
    "name": "North Macedonia",
    "tz": "Europe/Skopje",
    "city": "Skopje",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Skopje"
    ],
    "regions": []
  },
  "ML": {
    "name": "Mali",
    "tz": "Africa/Bamako",
    "city": "Bamako",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Bamako"
    ],
    "regions": []
  },
  "MM": {
    "name": "Myanmar (Burma)",
    "tz": "Asia/Yangon",
    "city": "Yangon",
    "std": 390,
    "dst": null,
    "zones": [
      "Asia/Yangon"
    ],
    "regions": []
  },
  "MN": {
    "name": "Mongolia",
    "tz": "Asia/Ulaanbaatar",
    "city": "Ulaanbaatar",
    "std": 480,
    "dst": null,
    "zones": [
      "Asia/Ulaanbaatar",
      "Asia/Hovd"
    ],
    "regions": [
      "most of Mongolia",
      "Bayan-Olgii, Hovd, Uvs"
    ]
  },
  "MO": {
    "name": "Macau",
    "tz": "Asia/Macau",
    "city": "Macau",
    "std": 480,
    "dst": null,
    "zones": [
      "Asia/Macau"
    ],
    "regions": []
  },
  "MP": {
    "name": "Northern Mariana Islands",
    "tz": "Pacific/Saipan",
    "city": "Saipan",
    "std": 600,
    "dst": null,
    "zones": [
      "Pacific/Saipan"
    ],
    "regions": []
  },
  "MQ": {
    "name": "Martinique",
    "tz": "America/Martinique",
    "city": "Martinique",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Martinique"
    ],
    "regions": []
  },
  "MR": {
    "name": "Mauritania",
    "tz": "Africa/Nouakchott",
    "city": "Nouakchott",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Nouakchott"
    ],
    "regions": []
  },
  "MS": {
    "name": "Montserrat",
    "tz": "America/Montserrat",
    "city": "Montserrat",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Montserrat"
    ],
    "regions": []
  },
  "MT": {
    "name": "Malta",
    "tz": "Europe/Malta",
    "city": "Malta",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Malta"
    ],
    "regions": []
  },
  "MU": {
    "name": "Mauritius",
    "tz": "Indian/Mauritius",
    "city": "Mauritius",
    "std": 240,
    "dst": null,
    "zones": [
      "Indian/Mauritius"
    ],
    "regions": []
  },
  "MV": {
    "name": "Maldives",
    "tz": "Indian/Maldives",
    "city": "Maldives",
    "std": 300,
    "dst": null,
    "zones": [
      "Indian/Maldives"
    ],
    "regions": []
  },
  "MW": {
    "name": "Malawi",
    "tz": "Africa/Blantyre",
    "city": "Blantyre",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Blantyre"
    ],
    "regions": []
  },
  "MX": {
    "name": "Mexico",
    "tz": "America/Mexico_City",
    "city": "Mexico City",
    "std": -360,
    "dst": null,
    "zones": [
      "America/Mexico_City",
      "America/Cancun",
      "America/Merida",
      "America/Monterrey",
      "America/Matamoros",
      "America/Chihuahua",
      "America/Ciudad_Juarez",
      "America/Ojinaga",
      "America/Mazatlan",
      "America/Bahia_Banderas",
      "America/Hermosillo",
      "America/Tijuana"
    ],
    "regions": [
      "Central Mexico",
      "Quintana Roo",
      "Campeche, Yucatan",
      "Durango; Coahuila, Nuevo Leon, Tamaulipas (most areas)",
      "Coahuila, Nuevo Leon, Tamaulipas (US border)",
      "Chihuahua (most areas)",
      "Chihuahua (US border - west)",
      "Chihuahua (US border - east)",
      "Baja California Sur, Nayarit (most areas), Sinaloa",
      "Bahia de Banderas",
      "Sonora",
      "Baja California"
    ]
  },
  "MY": {
    "name": "Malaysia",
    "tz": "Asia/Kuala_Lumpur",
    "city": "Kuala Lumpur",
    "std": 480,
    "dst": null,
    "zones": [
      "Asia/Kuala_Lumpur",
      "Asia/Kuching"
    ],
    "regions": [
      "Malaysia (peninsula)",
      "Sabah, Sarawak"
    ]
  },
  "MZ": {
    "name": "Mozambique",
    "tz": "Africa/Maputo",
    "city": "Maputo",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Maputo"
    ],
    "regions": []
  },
  "NA": {
    "name": "Namibia",
    "tz": "Africa/Windhoek",
    "city": "Windhoek",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Windhoek"
    ],
    "regions": []
  },
  "NC": {
    "name": "New Caledonia",
    "tz": "Pacific/Noumea",
    "city": "Noumea",
    "std": 660,
    "dst": null,
    "zones": [
      "Pacific/Noumea"
    ],
    "regions": []
  },
  "NE": {
    "name": "Niger",
    "tz": "Africa/Niamey",
    "city": "Niamey",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Niamey"
    ],
    "regions": []
  },
  "NF": {
    "name": "Norfolk Island",
    "tz": "Pacific/Norfolk",
    "city": "Norfolk",
    "std": 660,
    "dst": 720,
    "zones": [
      "Pacific/Norfolk"
    ],
    "regions": []
  },
  "NG": {
    "name": "Nigeria",
    "tz": "Africa/Lagos",
    "city": "Lagos",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Lagos"
    ],
    "regions": []
  },
  "NI": {
    "name": "Nicaragua",
    "tz": "America/Managua",
    "city": "Managua",
    "std": -360,
    "dst": null,
    "zones": [
      "America/Managua"
    ],
    "regions": []
  },
  "NL": {
    "name": "Netherlands",
    "tz": "Europe/Amsterdam",
    "city": "Amsterdam",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Amsterdam"
    ],
    "regions": []
  },
  "NO": {
    "name": "Norway",
    "tz": "Europe/Oslo",
    "city": "Oslo",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Oslo"
    ],
    "regions": []
  },
  "NP": {
    "name": "Nepal",
    "tz": "Asia/Kathmandu",
    "city": "Kathmandu",
    "std": 345,
    "dst": null,
    "zones": [
      "Asia/Kathmandu"
    ],
    "regions": []
  },
  "NR": {
    "name": "Nauru",
    "tz": "Pacific/Nauru",
    "city": "Nauru",
    "std": 720,
    "dst": null,
    "zones": [
      "Pacific/Nauru"
    ],
    "regions": []
  },
  "NU": {
    "name": "Niue",
    "tz": "Pacific/Niue",
    "city": "Niue",
    "std": -660,
    "dst": null,
    "zones": [
      "Pacific/Niue"
    ],
    "regions": []
  },
  "NZ": {
    "name": "New Zealand",
    "tz": "Pacific/Auckland",
    "city": "Auckland",
    "std": 720,
    "dst": 780,
    "zones": [
      "Pacific/Auckland",
      "Pacific/Chatham"
    ],
    "regions": [
      "most of New Zealand",
      "Chatham Islands"
    ]
  },
  "OM": {
    "name": "Oman",
    "tz": "Asia/Muscat",
    "city": "Muscat",
    "std": 240,
    "dst": null,
    "zones": [
      "Asia/Muscat"
    ],
    "regions": []
  },
  "PA": {
    "name": "Panama",
    "tz": "America/Panama",
    "city": "Panama",
    "std": -300,
    "dst": null,
    "zones": [
      "America/Panama"
    ],
    "regions": []
  },
  "PE": {
    "name": "Peru",
    "tz": "America/Lima",
    "city": "Lima",
    "std": -300,
    "dst": null,
    "zones": [
      "America/Lima"
    ],
    "regions": []
  },
  "PF": {
    "name": "French Polynesia",
    "tz": "Pacific/Tahiti",
    "city": "Tahiti",
    "std": -600,
    "dst": null,
    "zones": [
      "Pacific/Tahiti",
      "Pacific/Marquesas",
      "Pacific/Gambier"
    ],
    "regions": [
      "Society Islands",
      "Marquesas Islands",
      "Gambier Islands"
    ]
  },
  "PG": {
    "name": "Papua New Guinea",
    "tz": "Pacific/Port_Moresby",
    "city": "Port Moresby",
    "std": 600,
    "dst": null,
    "zones": [
      "Pacific/Port_Moresby",
      "Pacific/Bougainville"
    ],
    "regions": [
      "most of Papua New Guinea",
      "Bougainville"
    ]
  },
  "PH": {
    "name": "Philippines",
    "tz": "Asia/Manila",
    "city": "Manila",
    "std": 480,
    "dst": null,
    "zones": [
      "Asia/Manila"
    ],
    "regions": []
  },
  "PK": {
    "name": "Pakistan",
    "tz": "Asia/Karachi",
    "city": "Karachi",
    "std": 300,
    "dst": null,
    "zones": [
      "Asia/Karachi"
    ],
    "regions": []
  },
  "PL": {
    "name": "Poland",
    "tz": "Europe/Warsaw",
    "city": "Warsaw",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Warsaw"
    ],
    "regions": []
  },
  "PM": {
    "name": "St Pierre & Miquelon",
    "tz": "America/Miquelon",
    "city": "Miquelon",
    "std": -180,
    "dst": -120,
    "zones": [
      "America/Miquelon"
    ],
    "regions": []
  },
  "PN": {
    "name": "Pitcairn",
    "tz": "Pacific/Pitcairn",
    "city": "Pitcairn",
    "std": -480,
    "dst": null,
    "zones": [
      "Pacific/Pitcairn"
    ],
    "regions": []
  },
  "PR": {
    "name": "Puerto Rico",
    "tz": "America/Puerto_Rico",
    "city": "Puerto Rico",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Puerto_Rico"
    ],
    "regions": []
  },
  "PS": {
    "name": "Palestine",
    "tz": "Asia/Gaza",
    "city": "Gaza",
    "std": 120,
    "dst": 180,
    "zones": [
      "Asia/Gaza",
      "Asia/Hebron"
    ],
    "regions": [
      "Gaza Strip",
      "West Bank"
    ]
  },
  "PT": {
    "name": "Portugal",
    "tz": "Europe/Lisbon",
    "city": "Lisbon",
    "std": 0,
    "dst": 60,
    "zones": [
      "Europe/Lisbon",
      "Atlantic/Madeira",
      "Atlantic/Azores"
    ],
    "regions": [
      "Portugal (mainland)",
      "Madeira Islands",
      "Azores"
    ]
  },
  "PW": {
    "name": "Palau",
    "tz": "Pacific/Palau",
    "city": "Palau",
    "std": 540,
    "dst": null,
    "zones": [
      "Pacific/Palau"
    ],
    "regions": []
  },
  "PY": {
    "name": "Paraguay",
    "tz": "America/Asuncion",
    "city": "Asuncion",
    "std": -180,
    "dst": null,
    "zones": [
      "America/Asuncion"
    ],
    "regions": []
  },
  "QA": {
    "name": "Qatar",
    "tz": "Asia/Qatar",
    "city": "Qatar",
    "std": 180,
    "dst": null,
    "zones": [
      "Asia/Qatar"
    ],
    "regions": []
  },
  "RE": {
    "name": "Réunion",
    "tz": "Indian/Reunion",
    "city": "Reunion",
    "std": 240,
    "dst": null,
    "zones": [
      "Indian/Reunion"
    ],
    "regions": []
  },
  "RO": {
    "name": "Romania",
    "tz": "Europe/Bucharest",
    "city": "Bucharest",
    "std": 120,
    "dst": 180,
    "zones": [
      "Europe/Bucharest"
    ],
    "regions": []
  },
  "RS": {
    "name": "Serbia",
    "tz": "Europe/Belgrade",
    "city": "Belgrade",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Belgrade"
    ],
    "regions": []
  },
  "RU": {
    "name": "Russia",
    "tz": "Europe/Moscow",
    "city": "Moscow",
    "std": 180,
    "dst": null,
    "zones": [
      "Europe/Kaliningrad",
      "Europe/Moscow",
      "Europe/Kirov",
      "Europe/Volgograd",
      "Europe/Astrakhan",
      "Europe/Saratov",
      "Europe/Ulyanovsk",
      "Europe/Samara",
      "Asia/Yekaterinburg",
      "Asia/Omsk",
      "Asia/Novosibirsk",
      "Asia/Barnaul",
      "Asia/Tomsk",
      "Asia/Novokuznetsk",
      "Asia/Krasnoyarsk",
      "Asia/Irkutsk",
      "Asia/Chita",
      "Asia/Yakutsk",
      "Asia/Khandyga",
      "Asia/Vladivostok",
      "Asia/Ust-Nera",
      "Asia/Magadan",
      "Asia/Sakhalin",
      "Asia/Srednekolymsk",
      "Asia/Kamchatka",
      "Asia/Anadyr"
    ],
    "regions": [
      "MSK-01 - Kaliningrad",
      "MSK+00 - Moscow area",
      "MSK+00 - Kirov",
      "MSK+00 - Volgograd",
      "MSK+01 - Astrakhan",
      "MSK+01 - Saratov",
      "MSK+01 - Ulyanovsk",
      "MSK+01 - Samara, Udmurtia",
      "MSK+02 - Urals",
      "MSK+03 - Omsk",
      "MSK+04 - Novosibirsk",
      "MSK+04 - Altai",
      "MSK+04 - Tomsk",
      "MSK+04 - Kemerovo",
      "MSK+04 - Krasnoyarsk area",
      "MSK+05 - Irkutsk, Buryatia",
      "MSK+06 - Zabaykalsky",
      "MSK+06 - Lena River",
      "MSK+06 - Tomponsky, Ust-Maysky",
      "MSK+07 - Amur River",
      "MSK+07 - Oymyakonsky",
      "MSK+08 - Magadan",
      "MSK+08 - Sakhalin Island",
      "MSK+08 - Sakha (E), N Kuril Is",
      "MSK+09 - Kamchatka",
      "MSK+09 - Bering Sea"
    ]
  },
  "RW": {
    "name": "Rwanda",
    "tz": "Africa/Kigali",
    "city": "Kigali",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Kigali"
    ],
    "regions": []
  },
  "SA": {
    "name": "Saudi Arabia",
    "tz": "Asia/Riyadh",
    "city": "Riyadh",
    "std": 180,
    "dst": null,
    "zones": [
      "Asia/Riyadh"
    ],
    "regions": []
  },
  "SB": {
    "name": "Solomon Islands",
    "tz": "Pacific/Guadalcanal",
    "city": "Guadalcanal",
    "std": 660,
    "dst": null,
    "zones": [
      "Pacific/Guadalcanal"
    ],
    "regions": []
  },
  "SC": {
    "name": "Seychelles",
    "tz": "Indian/Mahe",
    "city": "Mahe",
    "std": 240,
    "dst": null,
    "zones": [
      "Indian/Mahe"
    ],
    "regions": []
  },
  "SD": {
    "name": "Sudan",
    "tz": "Africa/Khartoum",
    "city": "Khartoum",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Khartoum"
    ],
    "regions": []
  },
  "SE": {
    "name": "Sweden",
    "tz": "Europe/Stockholm",
    "city": "Stockholm",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Stockholm"
    ],
    "regions": []
  },
  "SG": {
    "name": "Singapore",
    "tz": "Asia/Singapore",
    "city": "Singapore",
    "std": 480,
    "dst": null,
    "zones": [
      "Asia/Singapore"
    ],
    "regions": []
  },
  "SH": {
    "name": "St Helena",
    "tz": "Atlantic/St_Helena",
    "city": "St Helena",
    "std": 0,
    "dst": null,
    "zones": [
      "Atlantic/St_Helena"
    ],
    "regions": []
  },
  "SI": {
    "name": "Slovenia",
    "tz": "Europe/Ljubljana",
    "city": "Ljubljana",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Ljubljana"
    ],
    "regions": []
  },
  "SJ": {
    "name": "Svalbard & Jan Mayen",
    "tz": "Arctic/Longyearbyen",
    "city": "Longyearbyen",
    "std": 60,
    "dst": 120,
    "zones": [
      "Arctic/Longyearbyen"
    ],
    "regions": []
  },
  "SK": {
    "name": "Slovakia",
    "tz": "Europe/Bratislava",
    "city": "Bratislava",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Bratislava"
    ],
    "regions": []
  },
  "SL": {
    "name": "Sierra Leone",
    "tz": "Africa/Freetown",
    "city": "Freetown",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Freetown"
    ],
    "regions": []
  },
  "SM": {
    "name": "San Marino",
    "tz": "Europe/San_Marino",
    "city": "San Marino",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/San_Marino"
    ],
    "regions": []
  },
  "SN": {
    "name": "Senegal",
    "tz": "Africa/Dakar",
    "city": "Dakar",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Dakar"
    ],
    "regions": []
  },
  "SO": {
    "name": "Somalia",
    "tz": "Africa/Mogadishu",
    "city": "Mogadishu",
    "std": 180,
    "dst": null,
    "zones": [
      "Africa/Mogadishu"
    ],
    "regions": []
  },
  "SR": {
    "name": "Suriname",
    "tz": "America/Paramaribo",
    "city": "Paramaribo",
    "std": -180,
    "dst": null,
    "zones": [
      "America/Paramaribo"
    ],
    "regions": []
  },
  "SS": {
    "name": "South Sudan",
    "tz": "Africa/Juba",
    "city": "Juba",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Juba"
    ],
    "regions": []
  },
  "ST": {
    "name": "Sao Tome & Principe",
    "tz": "Africa/Sao_Tome",
    "city": "Sao Tome",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Sao_Tome"
    ],
    "regions": []
  },
  "SV": {
    "name": "El Salvador",
    "tz": "America/El_Salvador",
    "city": "El Salvador",
    "std": -360,
    "dst": null,
    "zones": [
      "America/El_Salvador"
    ],
    "regions": []
  },
  "SX": {
    "name": "St Maarten (Dutch)",
    "tz": "America/Lower_Princes",
    "city": "Lower Princes",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Lower_Princes"
    ],
    "regions": []
  },
  "SY": {
    "name": "Syria",
    "tz": "Asia/Damascus",
    "city": "Damascus",
    "std": 180,
    "dst": null,
    "zones": [
      "Asia/Damascus"
    ],
    "regions": []
  },
  "SZ": {
    "name": "Eswatini (Swaziland)",
    "tz": "Africa/Mbabane",
    "city": "Mbabane",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Mbabane"
    ],
    "regions": []
  },
  "TC": {
    "name": "Turks & Caicos Is",
    "tz": "America/Grand_Turk",
    "city": "Grand Turk",
    "std": -300,
    "dst": -240,
    "zones": [
      "America/Grand_Turk"
    ],
    "regions": []
  },
  "TD": {
    "name": "Chad",
    "tz": "Africa/Ndjamena",
    "city": "Ndjamena",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Ndjamena"
    ],
    "regions": []
  },
  "TF": {
    "name": "French S. Terr.",
    "tz": "Indian/Kerguelen",
    "city": "Kerguelen",
    "std": 300,
    "dst": null,
    "zones": [
      "Indian/Kerguelen"
    ],
    "regions": []
  },
  "TG": {
    "name": "Togo",
    "tz": "Africa/Lome",
    "city": "Lome",
    "std": 0,
    "dst": null,
    "zones": [
      "Africa/Lome"
    ],
    "regions": []
  },
  "TH": {
    "name": "Thailand",
    "tz": "Asia/Bangkok",
    "city": "Bangkok",
    "std": 420,
    "dst": null,
    "zones": [
      "Asia/Bangkok"
    ],
    "regions": []
  },
  "TJ": {
    "name": "Tajikistan",
    "tz": "Asia/Dushanbe",
    "city": "Dushanbe",
    "std": 300,
    "dst": null,
    "zones": [
      "Asia/Dushanbe"
    ],
    "regions": []
  },
  "TK": {
    "name": "Tokelau",
    "tz": "Pacific/Fakaofo",
    "city": "Fakaofo",
    "std": 780,
    "dst": null,
    "zones": [
      "Pacific/Fakaofo"
    ],
    "regions": []
  },
  "TL": {
    "name": "East Timor",
    "tz": "Asia/Dili",
    "city": "Dili",
    "std": 540,
    "dst": null,
    "zones": [
      "Asia/Dili"
    ],
    "regions": []
  },
  "TM": {
    "name": "Turkmenistan",
    "tz": "Asia/Ashgabat",
    "city": "Ashgabat",
    "std": 300,
    "dst": null,
    "zones": [
      "Asia/Ashgabat"
    ],
    "regions": []
  },
  "TN": {
    "name": "Tunisia",
    "tz": "Africa/Tunis",
    "city": "Tunis",
    "std": 60,
    "dst": null,
    "zones": [
      "Africa/Tunis"
    ],
    "regions": []
  },
  "TO": {
    "name": "Tonga",
    "tz": "Pacific/Tongatapu",
    "city": "Tongatapu",
    "std": 780,
    "dst": null,
    "zones": [
      "Pacific/Tongatapu"
    ],
    "regions": []
  },
  "TR": {
    "name": "Turkey",
    "tz": "Europe/Istanbul",
    "city": "Istanbul",
    "std": 180,
    "dst": null,
    "zones": [
      "Europe/Istanbul"
    ],
    "regions": []
  },
  "TT": {
    "name": "Trinidad & Tobago",
    "tz": "America/Port_of_Spain",
    "city": "Port of Spain",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Port_of_Spain"
    ],
    "regions": []
  },
  "TV": {
    "name": "Tuvalu",
    "tz": "Pacific/Funafuti",
    "city": "Funafuti",
    "std": 720,
    "dst": null,
    "zones": [
      "Pacific/Funafuti"
    ],
    "regions": []
  },
  "TW": {
    "name": "Taiwan",
    "tz": "Asia/Taipei",
    "city": "Taipei",
    "std": 480,
    "dst": null,
    "zones": [
      "Asia/Taipei"
    ],
    "regions": []
  },
  "TZ": {
    "name": "Tanzania",
    "tz": "Africa/Dar_es_Salaam",
    "city": "Dar es Salaam",
    "std": 180,
    "dst": null,
    "zones": [
      "Africa/Dar_es_Salaam"
    ],
    "regions": []
  },
  "UA": {
    "name": "Ukraine",
    "tz": "Europe/Kyiv",
    "city": "Kyiv",
    "std": 120,
    "dst": 180,
    "zones": [
      "Europe/Simferopol",
      "Europe/Kyiv"
    ],
    "regions": [
      "Crimea",
      "most of Ukraine"
    ]
  },
  "UG": {
    "name": "Uganda",
    "tz": "Africa/Kampala",
    "city": "Kampala",
    "std": 180,
    "dst": null,
    "zones": [
      "Africa/Kampala"
    ],
    "regions": []
  },
  "UM": {
    "name": "US minor outlying islands",
    "tz": "Pacific/Midway",
    "city": "Midway",
    "std": -660,
    "dst": null,
    "zones": [
      "Pacific/Midway",
      "Pacific/Wake"
    ],
    "regions": [
      "Midway Islands",
      "Wake Island"
    ]
  },
  "US": {
    "name": "United States",
    "tz": "America/New_York",
    "city": "New York",
    "std": -300,
    "dst": -240,
    "zones": [
      "America/New_York",
      "America/Detroit",
      "America/Kentucky/Louisville",
      "America/Kentucky/Monticello",
      "America/Indiana/Indianapolis",
      "America/Indiana/Vincennes",
      "America/Indiana/Winamac",
      "America/Indiana/Marengo",
      "America/Indiana/Petersburg",
      "America/Indiana/Vevay",
      "America/Chicago",
      "America/Indiana/Tell_City",
      "America/Indiana/Knox",
      "America/Menominee",
      "America/North_Dakota/Center",
      "America/North_Dakota/New_Salem",
      "America/North_Dakota/Beulah",
      "America/Denver",
      "America/Boise",
      "America/Phoenix",
      "America/Los_Angeles",
      "America/Anchorage",
      "America/Juneau",
      "America/Sitka",
      "America/Metlakatla",
      "America/Yakutat",
      "America/Nome",
      "America/Adak",
      "Pacific/Honolulu"
    ],
    "regions": [
      "Eastern (most areas)",
      "Eastern - MI (most areas)",
      "Eastern - KY (Louisville area)",
      "Eastern - KY (Wayne)",
      "Eastern - IN (most areas)",
      "Eastern - IN (Da, Du, K, Mn)",
      "Eastern - IN (Pulaski)",
      "Eastern - IN (Crawford)",
      "Eastern - IN (Pike)",
      "Eastern - IN (Switzerland)",
      "Central (most areas)",
      "Central - IN (Perry)",
      "Central - IN (Starke)",
      "Central - MI (Wisconsin border)",
      "Central - ND (Oliver)",
      "Central - ND (Morton rural)",
      "Central - ND (Mercer)",
      "Mountain (most areas)",
      "Mountain - ID (south), OR (east)",
      "MST - AZ (except Navajo)",
      "Pacific",
      "Alaska (most areas)",
      "Alaska - Juneau area",
      "Alaska - Sitka area",
      "Alaska - Annette Island",
      "Alaska - Yakutat",
      "Alaska (west)",
      "Alaska - western Aleutians",
      "Hawaii"
    ]
  },
  "UY": {
    "name": "Uruguay",
    "tz": "America/Montevideo",
    "city": "Montevideo",
    "std": -180,
    "dst": null,
    "zones": [
      "America/Montevideo"
    ],
    "regions": []
  },
  "UZ": {
    "name": "Uzbekistan",
    "tz": "Asia/Tashkent",
    "city": "Tashkent",
    "std": 300,
    "dst": null,
    "zones": [
      "Asia/Samarkand",
      "Asia/Tashkent"
    ],
    "regions": [
      "Uzbekistan (west)",
      "Uzbekistan (east)"
    ]
  },
  "VA": {
    "name": "Vatican City",
    "tz": "Europe/Vatican",
    "city": "Vatican",
    "std": 60,
    "dst": 120,
    "zones": [
      "Europe/Vatican"
    ],
    "regions": []
  },
  "VC": {
    "name": "St Vincent",
    "tz": "America/St_Vincent",
    "city": "St Vincent",
    "std": -240,
    "dst": null,
    "zones": [
      "America/St_Vincent"
    ],
    "regions": []
  },
  "VE": {
    "name": "Venezuela",
    "tz": "America/Caracas",
    "city": "Caracas",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Caracas"
    ],
    "regions": []
  },
  "VG": {
    "name": "Virgin Islands (UK)",
    "tz": "America/Tortola",
    "city": "Tortola",
    "std": -240,
    "dst": null,
    "zones": [
      "America/Tortola"
    ],
    "regions": []
  },
  "VI": {
    "name": "Virgin Islands (US)",
    "tz": "America/St_Thomas",
    "city": "St Thomas",
    "std": -240,
    "dst": null,
    "zones": [
      "America/St_Thomas"
    ],
    "regions": []
  },
  "VN": {
    "name": "Vietnam",
    "tz": "Asia/Ho_Chi_Minh",
    "city": "Ho Chi Minh",
    "std": 420,
    "dst": null,
    "zones": [
      "Asia/Ho_Chi_Minh"
    ],
    "regions": []
  },
  "VU": {
    "name": "Vanuatu",
    "tz": "Pacific/Efate",
    "city": "Efate",
    "std": 660,
    "dst": null,
    "zones": [
      "Pacific/Efate"
    ],
    "regions": []
  },
  "WF": {
    "name": "Wallis & Futuna",
    "tz": "Pacific/Wallis",
    "city": "Wallis",
    "std": 720,
    "dst": null,
    "zones": [
      "Pacific/Wallis"
    ],
    "regions": []
  },
  "WS": {
    "name": "Samoa (western)",
    "tz": "Pacific/Apia",
    "city": "Apia",
    "std": 780,
    "dst": null,
    "zones": [
      "Pacific/Apia"
    ],
    "regions": []
  },
  "YE": {
    "name": "Yemen",
    "tz": "Asia/Aden",
    "city": "Aden",
    "std": 180,
    "dst": null,
    "zones": [
      "Asia/Aden"
    ],
    "regions": []
  },
  "YT": {
    "name": "Mayotte",
    "tz": "Indian/Mayotte",
    "city": "Mayotte",
    "std": 180,
    "dst": null,
    "zones": [
      "Indian/Mayotte"
    ],
    "regions": []
  },
  "ZA": {
    "name": "South Africa",
    "tz": "Africa/Johannesburg",
    "city": "Johannesburg",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Johannesburg"
    ],
    "regions": []
  },
  "ZM": {
    "name": "Zambia",
    "tz": "Africa/Lusaka",
    "city": "Lusaka",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Lusaka"
    ],
    "regions": []
  },
  "ZW": {
    "name": "Zimbabwe",
    "tz": "Africa/Harare",
    "city": "Harare",
    "std": 120,
    "dst": null,
    "zones": [
      "Africa/Harare"
    ],
    "regions": []
  }
};

// Lowercased country name / ISO code / capital city / common alias -> ISO code.
const COUNTRY_ALIASES = {
  "abidjan": "CI",
  "abu dhabi": "AE",
  "accra": "GH",
  "ad": "AD",
  "addis ababa": "ET",
  "aden": "YE",
  "ae": "AE",
  "af": "AF",
  "afghanistan": "AF",
  "ag": "AG",
  "ai": "AI",
  "al": "AL",
  "aland islands": "AX",
  "albania": "AL",
  "algeria": "DZ",
  "algiers": "DZ",
  "almaty": "KZ",
  "am": "AM",
  "america": "US",
  "amman": "JO",
  "amsterdam": "NL",
  "andorra": "AD",
  "angola": "AO",
  "anguilla": "AI",
  "antananarivo": "MG",
  "antarctica": "AQ",
  "antigua": "AG",
  "antigua & barbuda": "AG",
  "ao": "AO",
  "apia": "WS",
  "aq": "AQ",
  "ar": "AR",
  "argentina": "AR",
  "armenia": "AM",
  "aruba": "AW",
  "as": "AS",
  "ashgabat": "TM",
  "asmara": "ER",
  "asuncion": "PY",
  "at": "AT",
  "athens": "GR",
  "au": "AU",
  "auckland": "NZ",
  "australia": "AU",
  "austria": "AT",
  "aw": "AW",
  "ax": "AX",
  "az": "AZ",
  "azerbaijan": "AZ",
  "ba": "BA",
  "baghdad": "IQ",
  "bahamas": "BS",
  "bahrain": "BH",
  "baku": "AZ",
  "bamako": "ML",
  "bangkok": "TH",
  "bangladesh": "BD",
  "bangui": "CF",
  "banjul": "GM",
  "barbados": "BB",
  "bb": "BB",
  "bd": "BD",
  "be": "BE",
  "beirut": "LB",
  "belarus": "BY",
  "belgium": "BE",
  "belgrade": "RS",
  "belize": "BZ",
  "benin": "BJ",
  "berlin": "DE",
  "bermuda": "BM",
  "bf": "BF",
  "bg": "BG",
  "bh": "BH",
  "bhutan": "BT",
  "bi": "BI",
  "bishkek": "KG",
  "bissau": "GW",
  "bj": "BJ",
  "bl": "BL",
  "blantyre": "MW",
  "bm": "BM",
  "bn": "BN",
  "bo": "BO",
  "bogota": "CO",
  "bolivia": "BO",
  "bosnia": "BA",
  "bosnia & herzegovina": "BA",
  "botswana": "BW",
  "bq": "BQ",
  "br": "BR",
  "bratislava": "SK",
  "brazil": "BR",
  "brazzaville": "CG",
  "britain": "GB",
  "britain uk": "GB",
  "british indian ocean territory": "IO",
  "brunei": "BN",
  "brussels": "BE",
  "bs": "BS",
  "bt": "BT",
  "bucharest": "RO",
  "budapest": "HU",
  "buenos aires": "AR",
  "bujumbura": "BI",
  "bulgaria": "BG",
  "burkina": "BF",
  "burkina faso": "BF",
  "burma": "MM",
  "burundi": "BI",
  "bw": "BW",
  "by": "BY",
  "bz": "BZ",
  "ca": "CA",
  "cabo verde": "CV",
  "cairo": "EG",
  "cambodia": "KH",
  "cameroon": "CM",
  "canada": "CA",
  "cape verde": "CV",
  "caracas": "VE",
  "caribbean nl": "BQ",
  "casablanca": "MA",
  "cayenne": "GF",
  "cayman": "KY",
  "cayman islands": "KY",
  "cc": "CC",
  "cd": "CD",
  "central african rep": "CF",
  "cf": "CF",
  "cg": "CG",
  "ch": "CH",
  "chad": "TD",
  "chagos": "IO",
  "chile": "CL",
  "china": "CN",
  "chisinau": "MD",
  "christmas": "CX",
  "christmas island": "CX",
  "ci": "CI",
  "ck": "CK",
  "cl": "CL",
  "cm": "CM",
  "cn": "CN",
  "co": "CO",
  "cocos": "CC",
  "cocos keeling islands": "CC",
  "colombia": "CO",
  "colombo": "LK",
  "comoro": "KM",
  "comoros": "KM",
  "conakry": "GN",
  "congo": "CD",
  "congo brazzaville": "CG",
  "congo dem rep": "CD",
  "congo rep": "CG",
  "cook islands": "CK",
  "copenhagen": "DK",
  "costa rica": "CR",
  "cote d ivoire": "CI",
  "cr": "CR",
  "croatia": "HR",
  "cu": "CU",
  "cuba": "CU",
  "curacao": "CW",
  "cv": "CV",
  "cw": "CW",
  "cx": "CX",
  "cy": "CY",
  "cyprus": "CY",
  "cz": "CZ",
  "czech": "CZ",
  "czech republic": "CZ",
  "czechia": "CZ",
  "dakar": "SN",
  "damascus": "SY",
  "dar es salaam": "TZ",
  "de": "DE",
  "democratic republic of the congo": "CD",
  "denmark": "DK",
  "deutschland": "DE",
  "dhaka": "BD",
  "dili": "TL",
  "dj": "DJ",
  "djibouti": "DJ",
  "dk": "DK",
  "dm": "DM",
  "do": "DO",
  "dominica": "DM",
  "dominican republic": "DO",
  "douala": "CM",
  "dr congo": "CD",
  "drc": "CD",
  "dubai": "AE",
  "dublin": "IE",
  "dushanbe": "TJ",
  "dz": "DZ",
  "east timor": "TL",
  "ec": "EC",
  "ecuador": "EC",
  "ee": "EE",
  "efate": "VU",
  "eg": "EG",
  "egypt": "EG",
  "eh": "EH",
  "el aaiun": "EH",
  "el salvador": "SV",
  "emirates": "AE",
  "england": "GB",
  "equatorial guinea": "GQ",
  "er": "ER",
  "eritrea": "ER",
  "es": "ES",
  "estonia": "EE",
  "eswatini": "SZ",
  "eswatini swaziland": "SZ",
  "et": "ET",
  "ethiopia": "ET",
  "fakaofo": "TK",
  "falkland islands": "FK",
  "faroe": "FO",
  "faroe islands": "FO",
  "fi": "FI",
  "fiji": "FJ",
  "finland": "FI",
  "fj": "FJ",
  "fk": "FK",
  "fm": "FM",
  "fo": "FO",
  "fr": "FR",
  "france": "FR",
  "freetown": "SL",
  "french guiana": "GF",
  "french polynesia": "PF",
  "french s terr": "TF",
  "funafuti": "TV",
  "ga": "GA",
  "gabon": "GA",
  "gaborone": "BW",
  "gambia": "GM",
  "gaza": "PS",
  "gb": "GB",
  "gd": "GD",
  "ge": "GE",
  "georgia": "GE",
  "germany": "DE",
  "gf": "GF",
  "gg": "GG",
  "gh": "GH",
  "ghana": "GH",
  "gi": "GI",
  "gibraltar": "GI",
  "gl": "GL",
  "gm": "GM",
  "gn": "GN",
  "gp": "GP",
  "gq": "GQ",
  "gr": "GR",
  "grand turk": "TC",
  "great britain": "GB",
  "greece": "GR",
  "greenland": "GL",
  "grenada": "GD",
  "gs": "GS",
  "gt": "GT",
  "gu": "GU",
  "guadalcanal": "SB",
  "guadeloupe": "GP",
  "guam": "GU",
  "guatemala": "GT",
  "guayaquil": "EC",
  "guernsey": "GG",
  "guinea": "GN",
  "guinea bissau": "GW",
  "guyana": "GY",
  "gw": "GW",
  "gy": "GY",
  "haiti": "HT",
  "harare": "ZW",
  "havana": "CU",
  "helsinki": "FI",
  "herzegovina": "BA",
  "hk": "HK",
  "hn": "HN",
  "ho chi minh": "VN",
  "holland": "NL",
  "honduras": "HN",
  "hong kong": "HK",
  "hr": "HR",
  "ht": "HT",
  "hu": "HU",
  "hungary": "HU",
  "iceland": "IS",
  "id": "ID",
  "ie": "IE",
  "il": "IL",
  "im": "IM",
  "in": "IN",
  "india": "IN",
  "indonesia": "ID",
  "io": "IO",
  "iq": "IQ",
  "ir": "IR",
  "iran": "IR",
  "iraq": "IQ",
  "ireland": "IE",
  "is": "IS",
  "isle of man": "IM",
  "israel": "IL",
  "istanbul": "TR",
  "it": "IT",
  "italy": "IT",
  "ivory coast": "CI",
  "jakarta": "ID",
  "jamaica": "JM",
  "japan": "JP",
  "je": "JE",
  "jersey": "JE",
  "jerusalem": "IL",
  "jm": "JM",
  "jo": "JO",
  "johannesburg": "ZA",
  "jordan": "JO",
  "jp": "JP",
  "juba": "SS",
  "kabul": "AF",
  "kampala": "UG",
  "karachi": "PK",
  "kathmandu": "NP",
  "kazakhstan": "KZ",
  "ke": "KE",
  "kenya": "KE",
  "kerguelen": "TF",
  "kg": "KG",
  "kh": "KH",
  "khartoum": "SD",
  "ki": "KI",
  "kigali": "RW",
  "kinshasa": "CD",
  "kiribati": "KI",
  "km": "KM",
  "kn": "KN",
  "kolkata": "IN",
  "korea": "KR",
  "korea north": "KP",
  "korea south": "KR",
  "kp": "KP",
  "kr": "KR",
  "kralendijk": "BQ",
  "kuala lumpur": "MY",
  "kuwait": "KW",
  "kw": "KW",
  "ky": "KY",
  "kyiv": "UA",
  "kyrgyzstan": "KG",
  "kz": "KZ",
  "la": "LA",
  "la paz": "BO",
  "lagos": "NG",
  "laos": "LA",
  "latvia": "LV",
  "lb": "LB",
  "lc": "LC",
  "lebanon": "LB",
  "lesotho": "LS",
  "li": "LI",
  "liberia": "LR",
  "libreville": "GA",
  "libya": "LY",
  "liechtenstein": "LI",
  "lima": "PE",
  "lisbon": "PT",
  "lithuania": "LT",
  "ljubljana": "SI",
  "lk": "LK",
  "lome": "TG",
  "london": "GB",
  "longyearbyen": "SJ",
  "lower princes": "SX",
  "lr": "LR",
  "ls": "LS",
  "lt": "LT",
  "lu": "LU",
  "luanda": "AO",
  "lusaka": "ZM",
  "luxembourg": "LU",
  "lv": "LV",
  "ly": "LY",
  "ma": "MA",
  "macao": "MO",
  "macau": "MO",
  "macedonia": "MK",
  "madagascar": "MG",
  "madrid": "ES",
  "mahe": "SC",
  "majuro": "MH",
  "malabo": "GQ",
  "malawi": "MW",
  "malaysia": "MY",
  "maldives": "MV",
  "mali": "ML",
  "malta": "MT",
  "managua": "NI",
  "manila": "PH",
  "maputo": "MZ",
  "mariehamn": "AX",
  "marigot": "MF",
  "marshall islands": "MH",
  "martinique": "MQ",
  "maseru": "LS",
  "mauritania": "MR",
  "mauritius": "MU",
  "mayotte": "YT",
  "mbabane": "SZ",
  "mc": "MC",
  "mcmurdo": "AQ",
  "md": "MD",
  "me": "ME",
  "mexico": "MX",
  "mexico city": "MX",
  "mf": "MF",
  "mg": "MG",
  "mh": "MH",
  "micronesia": "FM",
  "midway": "UM",
  "minsk": "BY",
  "miquelon": "PM",
  "mk": "MK",
  "ml": "ML",
  "mm": "MM",
  "mn": "MN",
  "mo": "MO",
  "mogadishu": "SO",
  "moldova": "MD",
  "monaco": "MC",
  "mongolia": "MN",
  "monrovia": "LR",
  "montenegro": "ME",
  "montevideo": "UY",
  "montserrat": "MS",
  "morocco": "MA",
  "moscow": "RU",
  "mozambique": "MZ",
  "mp": "MP",
  "mq": "MQ",
  "mr": "MR",
  "ms": "MS",
  "mt": "MT",
  "mu": "MU",
  "muscat": "OM",
  "mv": "MV",
  "mw": "MW",
  "mx": "MX",
  "my": "MY",
  "myanmar": "MM",
  "myanmar burma": "MM",
  "mz": "MZ",
  "na": "NA",
  "nairobi": "KE",
  "namibia": "NA",
  "nassau": "BS",
  "nauru": "NR",
  "nc": "NC",
  "ndjamena": "TD",
  "ne": "NE",
  "nepal": "NP",
  "netherlands": "NL",
  "new caledonia": "NC",
  "new york": "US",
  "new zealand": "NZ",
  "nf": "NF",
  "ng": "NG",
  "ni": "NI",
  "niamey": "NE",
  "nicaragua": "NI",
  "nicosia": "CY",
  "niger": "NE",
  "nigeria": "NG",
  "niue": "NU",
  "nl": "NL",
  "no": "NO",
  "norfolk": "NF",
  "norfolk island": "NF",
  "north korea": "KP",
  "north macedonia": "MK",
  "northern ireland": "GB",
  "northern mariana islands": "MP",
  "norway": "NO",
  "nouakchott": "MR",
  "noumea": "NC",
  "np": "NP",
  "nr": "NR",
  "nu": "NU",
  "nuuk": "GL",
  "nz": "NZ",
  "om": "OM",
  "oman": "OM",
  "oslo": "NO",
  "ouagadougou": "BF",
  "pa": "PA",
  "pago pago": "AS",
  "pakistan": "PK",
  "palau": "PW",
  "palestine": "PS",
  "panama": "PA",
  "papua new guinea": "PG",
  "paraguay": "PY",
  "paramaribo": "SR",
  "paris": "FR",
  "pe": "PE",
  "persia": "IR",
  "peru": "PE",
  "pf": "PF",
  "pg": "PG",
  "ph": "PH",
  "philippines": "PH",
  "phnom penh": "KH",
  "pitcairn": "PN",
  "pk": "PK",
  "pl": "PL",
  "pm": "PM",
  "pn": "PN",
  "podgorica": "ME",
  "pohnpei": "FM",
  "poland": "PL",
  "port au prince": "HT",
  "port moresby": "PG",
  "port of spain": "TT",
  "porto novo": "BJ",
  "portugal": "PT",
  "pr": "PR",
  "prague": "CZ",
  "ps": "PS",
  "pt": "PT",
  "puerto rico": "PR",
  "pw": "PW",
  "py": "PY",
  "pyongyang": "KP",
  "qa": "QA",
  "qatar": "QA",
  "rarotonga": "CK",
  "re": "RE",
  "republic of korea": "KR",
  "republic of the congo": "CG",
  "reunion": "RE",
  "reykjavik": "IS",
  "riga": "LV",
  "riyadh": "SA",
  "ro": "RO",
  "romania": "RO",
  "rome": "IT",
  "rs": "RS",
  "ru": "RU",
  "russia": "RU",
  "russian federation": "RU",
  "rw": "RW",
  "rwanda": "RW",
  "sa": "SA",
  "saipan": "MP",
  "samoa": "AS",
  "samoa american": "AS",
  "samoa western": "WS",
  "san marino": "SM",
  "santiago": "CL",
  "santo domingo": "DO",
  "sao paulo": "BR",
  "sao tome": "ST",
  "sao tome & principe": "ST",
  "sarajevo": "BA",
  "saudi": "SA",
  "saudi arabia": "SA",
  "sb": "SB",
  "sc": "SC",
  "scotland": "GB",
  "sd": "SD",
  "se": "SE",
  "senegal": "SN",
  "seoul": "KR",
  "serbia": "RS",
  "seychelles": "SC",
  "sg": "SG",
  "sh": "SH",
  "shanghai": "CN",
  "si": "SI",
  "sierra leone": "SL",
  "singapore": "SG",
  "sj": "SJ",
  "sk": "SK",
  "skopje": "MK",
  "sl": "SL",
  "slovakia": "SK",
  "slovenia": "SI",
  "sm": "SM",
  "sn": "SN",
  "so": "SO",
  "sofia": "BG",
  "solomon islands": "SB",
  "somalia": "SO",
  "south africa": "ZA",
  "south georgia": "GS",
  "south georgia & the south sandwich islands": "GS",
  "south korea": "KR",
  "south sudan": "SS",
  "spain": "ES",
  "sr": "SR",
  "sri lanka": "LK",
  "ss": "SS",
  "st": "ST",
  "st barthelemy": "BL",
  "st helena": "SH",
  "st kitts": "KN",
  "st kitts & nevis": "KN",
  "st lucia": "LC",
  "st maarten": "SX",
  "st maarten dutch": "SX",
  "st martin": "MF",
  "st martin french": "MF",
  "st pierre & miquelon": "PM",
  "st thomas": "VI",
  "st vincent": "VC",
  "stanley": "FK",
  "states": "US",
  "stockholm": "SE",
  "sudan": "SD",
  "suriname": "SR",
  "sv": "SV",
  "svalbard & jan mayen": "SJ",
  "swaziland": "SZ",
  "sweden": "SE",
  "switzerland": "CH",
  "sx": "SX",
  "sy": "SY",
  "sydney": "AU",
  "syria": "SY",
  "sz": "SZ",
  "tahiti": "PF",
  "taipei": "TW",
  "taiwan": "TW",
  "tajikistan": "TJ",
  "tallinn": "EE",
  "tanzania": "TZ",
  "tarawa": "KI",
  "tashkent": "UZ",
  "tbilisi": "GE",
  "tc": "TC",
  "td": "TD",
  "tegucigalpa": "HN",
  "tehran": "IR",
  "tf": "TF",
  "tg": "TG",
  "th": "TH",
  "thailand": "TH",
  "the netherlands": "NL",
  "thimphu": "BT",
  "timor leste": "TL",
  "tirane": "AL",
  "tj": "TJ",
  "tk": "TK",
  "tl": "TL",
  "tm": "TM",
  "tn": "TN",
  "to": "TO",
  "togo": "TG",
  "tokelau": "TK",
  "tokyo": "JP",
  "tonga": "TO",
  "tongatapu": "TO",
  "toronto": "CA",
  "tortola": "VG",
  "tr": "TR",
  "trinidad & tobago": "TT",
  "tripoli": "LY",
  "tt": "TT",
  "tunis": "TN",
  "tunisia": "TN",
  "turkey": "TR",
  "turkiye": "TR",
  "turkmenistan": "TM",
  "turks & caicos is": "TC",
  "tuvalu": "TV",
  "tv": "TV",
  "tw": "TW",
  "tz": "TZ",
  "u a e": "AE",
  "u k": "GB",
  "u s": "US",
  "u s a": "US",
  "ua": "UA",
  "uae": "AE",
  "ug": "UG",
  "uganda": "UG",
  "uk": "GB",
  "ukraine": "UA",
  "ulaanbaatar": "MN",
  "um": "UM",
  "united arab emirates": "AE",
  "united states": "US",
  "united states of america": "US",
  "uruguay": "UY",
  "us": "US",
  "us minor outlying islands": "UM",
  "usa": "US",
  "uy": "UY",
  "uz": "UZ",
  "uzbekistan": "UZ",
  "va": "VA",
  "vaduz": "LI",
  "vanuatu": "VU",
  "vatican": "VA",
  "vatican city": "VA",
  "vc": "VC",
  "ve": "VE",
  "venezuela": "VE",
  "vg": "VG",
  "vi": "VI",
  "vienna": "AT",
  "vientiane": "LA",
  "viet nam": "VN",
  "vietnam": "VN",
  "vilnius": "LT",
  "virgin islands": "VG",
  "virgin islands uk": "VG",
  "virgin islands us": "VI",
  "vn": "VN",
  "vu": "VU",
  "wales": "GB",
  "wallis": "WF",
  "wallis & futuna": "WF",
  "warsaw": "PL",
  "western sahara": "EH",
  "wf": "WF",
  "windhoek": "NA",
  "ws": "WS",
  "yangon": "MM",
  "ye": "YE",
  "yemen": "YE",
  "yerevan": "AM",
  "yt": "YT",
  "za": "ZA",
  "zagreb": "HR",
  "zambia": "ZM",
  "zimbabwe": "ZW",
  "zm": "ZM",
  "zurich": "CH",
  "zw": "ZW"
};
