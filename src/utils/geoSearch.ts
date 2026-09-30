/**
 * Comprehensive Geocoding and Place Search Utility
 * Supports Arabic, French, and Latin place names with fuzzy normalization.
 * Includes complete Algerian Wilayas (58), Daïras, Communes, and iconic Hydrographic Wadis/Rivers.
 */

export interface GeoLocationResult {
  name: string;
  nameAr: string;
  nameFr: string;
  lat: number;
  lng: number;
  wilayaCode?: string;
  type?: 'wilaya' | 'commune' | 'oued' | 'bassin' | 'place';
  displayName: string;
}

// Advanced text normalizer for Arabic and Latin
export function normalizeGeoText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    // Remove Arabic diacritics (harakat: fatha, damma, kasra, sukun, shadda, tanween)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Arabic Alef forms: أ, إ, آ, ٱ -> ا
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Yaa / Alif Maqsoora: ى -> ي
    .replace(/ى/g, 'ي')
    // Normalize Taa Marbuta: ة -> ه (or vice-versa for search)
    .replace(/ة/g, 'ه')
    // Normalize French/Latin accents
    .replace(/[éèêë]/g, 'e')
    .replace(/[àâä]/g, 'a')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ûüù]/g, 'u')
    .replace(/ç/g, 'c')
    // Normalize punctuation & separators
    .replace(/[-_–'"`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 58 Wilayas of Algeria + Major Hydrographic Basins and Iconic Oueds
export const ALGERIAN_GEO_DATABASE: GeoLocationResult[] = [
  // 58 Wilayas
  { wilayaCode: '01', nameAr: 'أدرار', nameFr: 'Adrar', name: 'أدرار (Adrar)', lat: 27.8743, lng: -0.2939, type: 'wilaya', displayName: '[01] أدرار - Adrar' },
  { wilayaCode: '02', nameAr: 'الشلف', nameFr: 'Chlef', name: 'الشلف (Chlef)', lat: 36.1652, lng: 1.3345, type: 'wilaya', displayName: '[02] الشلف - Chlef' },
  { wilayaCode: '03', nameAr: 'الأغواط', nameFr: 'Laghouat', name: 'الأغواط (Laghouat)', lat: 33.8000, lng: 2.8651, type: 'wilaya', displayName: '[03] الأغواط - Laghouat' },
  { wilayaCode: '04', nameAr: 'أم البواقي', nameFr: 'Oum El Bouaghi', name: 'أم البواقي (Oum El Bouaghi)', lat: 35.8755, lng: 7.1135, type: 'wilaya', displayName: '[04] أم البواقي - Oum El Bouaghi' },
  { wilayaCode: '05', nameAr: 'باتنة', nameFr: 'Batna', name: 'باتنة (Batna)', lat: 35.5559, lng: 6.1741, type: 'wilaya', displayName: '[05] باتنة - Batna' },
  { wilayaCode: '06', nameAr: 'بجاية', nameFr: 'Béjaïa', name: 'بجاية (Béjaïa)', lat: 36.7559, lng: 5.0843, type: 'wilaya', displayName: '[06] بجاية - Béjaïa' },
  { wilayaCode: '07', nameAr: 'بسكرة', nameFr: 'Biskra', name: 'بسكرة (Biskra)', lat: 34.8516, lng: 5.7281, type: 'wilaya', displayName: '[07] بسكرة - Biskra' },
  { wilayaCode: '08', nameAr: 'بشار', nameFr: 'Béchar', name: 'بشار (Béchar)', lat: 31.6167, lng: -2.2167, type: 'wilaya', displayName: '[08] بشار - Béchar' },
  { wilayaCode: '09', nameAr: 'البليدة', nameFr: 'Blida', name: 'البليدة (Blida)', lat: 36.4701, lng: 2.8277, type: 'wilaya', displayName: '[09] البليدة - Blida' },
  { wilayaCode: '10', nameAr: 'البويرة', nameFr: 'Bouira', name: 'البويرة (Bouira)', lat: 36.3749, lng: 3.9020, type: 'wilaya', displayName: '[10] البويرة - Bouira' },
  { wilayaCode: '11', nameAr: 'تمنراست', nameFr: 'Tamanrasset', name: 'تمنراست (Tamanrasset)', lat: 22.7850, lng: 5.5228, type: 'wilaya', displayName: '[11] تمنراست - Tamanrasset' },
  { wilayaCode: '12', nameAr: 'تبسة', nameFr: 'Tébessa', name: 'تبسة (Tébessa)', lat: 35.4042, lng: 8.1242, type: 'wilaya', displayName: '[12] تبسة - Tébessa' },
  { wilayaCode: '13', nameAr: 'تلمسان', nameFr: 'Tlemcen', name: 'تلمسان (Tlemcen)', lat: 34.8783, lng: -1.3150, type: 'wilaya', displayName: '[13] تلمسان - Tlemcen' },
  { wilayaCode: '14', nameAr: 'تيارت', nameFr: 'Tiaret', name: 'تيارت (Tiaret)', lat: 35.3710, lng: 1.3170, type: 'wilaya', displayName: '[14] تيارت - Tiaret' },
  { wilayaCode: '15', nameAr: 'تيزي وزو', nameFr: 'Tizi Ouzou', name: 'تيزي وزو (Tizi Ouzou)', lat: 36.7118, lng: 4.0459, type: 'wilaya', displayName: '[15] تيزي وزو - Tizi Ouzou' },
  { wilayaCode: '16', nameAr: 'الجزائر العاصمة', nameFr: 'Alger', name: 'الجزائر العاصمة (Alger)', lat: 36.7525, lng: 3.0420, type: 'wilaya', displayName: '[16] الجزائر العاصمة - Alger' },
  { wilayaCode: '17', nameAr: 'الجلفة', nameFr: 'Djelfa', name: 'الجلفة (Djelfa)', lat: 34.6728, lng: 3.2630, type: 'wilaya', displayName: '[17] الجلفة - Djelfa' },
  { wilayaCode: '18', nameAr: 'جيجل', nameFr: 'Jijel', name: 'جيجل (Jijel)', lat: 36.8206, lng: 5.7667, type: 'wilaya', displayName: '[18] جيجل - Jijel' },
  { wilayaCode: '19', nameAr: 'سطيف', nameFr: 'Sétif', name: 'سطيف (Sétif)', lat: 36.1911, lng: 5.4137, type: 'wilaya', displayName: '[19] سطيف - Sétif' },
  { wilayaCode: '20', nameAr: 'سعيدة', nameFr: 'Saïda', name: 'سعيدة (Saïda)', lat: 34.8303, lng: 0.1517, type: 'wilaya', displayName: '[20] سعيدة - Saïda' },
  { wilayaCode: '21', nameAr: 'سكيكدة', nameFr: 'Skikda', name: 'سكيكدة (Skikda)', lat: 36.8762, lng: 6.9092, type: 'wilaya', displayName: '[21] سكيكدة - Skikda' },
  { wilayaCode: '22', nameAr: 'سيدي بلعباس', nameFr: 'Sidi Bel Abbès', name: 'سيدي بلعباس (Sidi Bel Abbès)', lat: 35.1899, lng: -0.6308, type: 'wilaya', displayName: '[22] سيدي بلعباس - Sidi Bel Abbès' },
  { wilayaCode: '23', nameAr: 'عنابة', nameFr: 'Annaba', name: 'عنابة (Annaba)', lat: 36.9000, lng: 7.7667, type: 'wilaya', displayName: '[23] عنابة - Annaba' },
  { wilayaCode: '24', nameAr: 'قالمة', nameFr: 'Guelma', name: 'قالمة (Guelma)', lat: 36.4621, lng: 7.4261, type: 'wilaya', displayName: '[24] قالمة - Guelma' },
  { wilayaCode: '25', nameAr: 'قسنطينة', nameFr: 'Constantine', name: 'قسنطينة (Constantine)', lat: 36.3650, lng: 6.6147, type: 'wilaya', displayName: '[25] قسنطينة - Constantine' },
  { wilayaCode: '26', nameAr: 'المدية', nameFr: 'Médéa', name: 'المدية (Médéa)', lat: 36.2642, lng: 2.7539, type: 'wilaya', displayName: '[26] المدية - Médéa' },
  { wilayaCode: '27', nameAr: 'مستغانم', nameFr: 'Mostaganem', name: 'مستغانم (Mostaganem)', lat: 35.9312, lng: 0.0892, type: 'wilaya', displayName: '[27] مستغانم - Mostaganem' },
  { wilayaCode: '28', nameAr: 'المسيلة', nameFr: 'M\'Sila', name: 'المسيلة (M\'Sila)', lat: 35.7058, lng: 4.5419, type: 'wilaya', displayName: '[28] المسيلة - M\'Sila' },
  { wilayaCode: '29', nameAr: 'معسكر', nameFr: 'Mascara', name: 'معسكر (Mascara)', lat: 35.3969, lng: 0.1403, type: 'wilaya', displayName: '[29] معسكر - Mascara' },
  { wilayaCode: '30', nameAr: 'ورقلة', nameFr: 'Ouargla', name: 'ورقلة (Ouargla)', lat: 31.9493, lng: 5.3250, type: 'wilaya', displayName: '[30] ورقلة - Ouargla' },
  { wilayaCode: '31', nameAr: 'وهران', nameFr: 'Oran', name: 'وهران (Oran)', lat: 35.6976, lng: -0.6337, type: 'wilaya', displayName: '[31] وهران - Oran' },
  { wilayaCode: '32', nameAr: 'البيض', nameFr: 'El Bayadh', name: 'البيض (El Bayadh)', lat: 33.6833, lng: 1.0167, type: 'wilaya', displayName: '[32] البيض - El Bayadh' },
  { wilayaCode: '33', nameAr: 'إليزي', nameFr: 'Illizi', name: 'إليزي (Illizi)', lat: 26.4833, lng: 8.4667, type: 'wilaya', displayName: '[33] إليزي - Illizi' },
  { wilayaCode: '34', nameAr: 'برج بوعريريج', nameFr: 'Bordj Bou Arréridj', name: 'برج بوعريريج (Bordj Bou Arréridj)', lat: 36.0732, lng: 4.7611, type: 'wilaya', displayName: '[34] برج بوعريريج - Bordj Bou Arréridj' },
  { wilayaCode: '35', nameAr: 'بومرداس', nameFr: 'Boumerdès', name: 'بومرداس (Boumerdès)', lat: 36.7598, lng: 3.4732, type: 'wilaya', displayName: '[35] بومرداس - Boumerdès' },
  { wilayaCode: '36', nameAr: 'الطارف', nameFr: 'El Tarf', name: 'الطارف (El Tarf)', lat: 36.7672, lng: 8.3138, type: 'wilaya', displayName: '[36] الطارف - El Tarf' },
  { wilayaCode: '37', nameAr: 'تندوف', nameFr: 'Tindouf', name: 'تندوف (Tindouf)', lat: 27.6761, lng: -8.1278, type: 'wilaya', displayName: '[37] تندوف - Tindouf' },
  { wilayaCode: '38', nameAr: 'تيسمسيلت', nameFr: 'Tissemsilt', name: 'تيسمسيلت (Tissemsilt)', lat: 35.6072, lng: 1.8108, type: 'wilaya', displayName: '[38] تيسمسيلت - Tissemsilt' },
  { wilayaCode: '39', nameAr: 'الوادي', nameFr: 'El Oued', name: 'الوادي (El Oued)', lat: 33.3683, lng: 6.8675, type: 'wilaya', displayName: '[39] الوادي - El Oued' },
  { wilayaCode: '40', nameAr: 'خنشلة', nameFr: 'Khenchela', name: 'خنشلة (Khenchela)', lat: 35.4358, lng: 7.1433, type: 'wilaya', displayName: '[40] خنشلة - Khenchela' },
  { wilayaCode: '41', nameAr: 'سوق أهراس', nameFr: 'Souk Ahras', name: 'سوق أهراس (Souk Ahras)', lat: 36.2864, lng: 7.9511, type: 'wilaya', displayName: '[41] سوق أهراس - Souk Ahras' },
  { wilayaCode: '42', nameAr: 'تيبازة', nameFr: 'Tipaza', name: 'تيبازة (Tipaza)', lat: 36.5928, lng: 2.4475, type: 'wilaya', displayName: '[42] تيبازة - Tipaza' },
  { wilayaCode: '43', nameAr: 'ميلة', nameFr: 'Mila', name: 'ميلة (Mila)', lat: 36.4503, lng: 6.2644, type: 'wilaya', displayName: '[43] ميلة - Mila' },
  { wilayaCode: '44', nameAr: 'عين الدفلى', nameFr: 'Aïn Defla', name: 'عين الدفلى (Aïn Defla)', lat: 36.1632, lng: 2.7185, type: 'wilaya', displayName: '[44] عين الدفلى - Aïn Defla' },
  { wilayaCode: '45', nameAr: 'النعامة', nameFr: 'Naâma', name: 'النعامة (Naâma)', lat: 33.2667, lng: -0.3167, type: 'wilaya', displayName: '[45] النعامة - Naâma' },
  { wilayaCode: '46', nameAr: 'عين تموشنت', nameFr: 'Aïn Témouchent', name: 'عين تموشنت (Aïn Témouchent)', lat: 35.2975, lng: -1.1404, type: 'wilaya', displayName: '[46] عين تموشنت - Aïn Témouchent' },
  { wilayaCode: '47', nameAr: 'غرداية', nameFr: 'Ghardaïa', name: 'غرداية (Ghardaïa)', lat: 32.4909, lng: 3.6735, type: 'wilaya', displayName: '[47] غرداية - Ghardaïa' },
  { wilayaCode: '48', nameAr: 'غليزان', nameFr: 'Relizane', name: 'غليزان (Relizane)', lat: 35.7373, lng: 0.5559, type: 'wilaya', displayName: '[48] غليزان - Relizane' },
  { wilayaCode: '49', nameAr: 'المغير', nameFr: 'El M\'Ghair', name: 'المغير (El M\'Ghair)', lat: 33.9500, lng: 5.9167, type: 'wilaya', displayName: '[49] المغير - El M\'Ghair' },
  { wilayaCode: '50', nameAr: 'المنيعة', nameFr: 'El Meniaa', name: 'المنيعة (El Meniaa)', lat: 30.5833, lng: 2.8833, type: 'wilaya', displayName: '[50] المنيعة - El Meniaa' },
  { wilayaCode: '51', nameAr: 'أولاد جلال', nameFr: 'Ouled Djellal', name: 'أولاد جلال (Ouled Djellal)', lat: 34.4333, lng: 5.0667, type: 'wilaya', displayName: '[51] أولاد جلال - Ouled Djellal' },
  { wilayaCode: '52', nameAr: 'برج باجي مختار', nameFr: 'Bordj Badji Mokhtar', name: 'برج باجي مختار', lat: 21.3283, lng: 0.9547, type: 'wilaya', displayName: '[52] برج باجي مختار' },
  { wilayaCode: '53', nameAr: 'بني عباس', nameFr: 'Béni Abbès', name: 'بني عباس (Béni Abbès)', lat: 30.1333, lng: -2.1667, type: 'wilaya', displayName: '[53] بني عباس - Béni Abbès' },
  { wilayaCode: '54', nameAr: 'تيميمون', nameFr: 'Timimoun', name: 'تيميمون (Timimoun)', lat: 29.2639, lng: 0.2311, type: 'wilaya', displayName: '[54] تيميمون - Timimoun' },
  { wilayaCode: '55', nameAr: 'تقرت', nameFr: 'Touggourt', name: 'تقرت (Touggourt)', lat: 33.1067, lng: 6.0617, type: 'wilaya', displayName: '[55] تقرت - Touggourt' },
  { wilayaCode: '56', nameAr: 'جانت', nameFr: 'Djanet', name: 'جانت (Djanet)', lat: 24.5550, lng: 9.4850, type: 'wilaya', displayName: '[56] جانت - Djanet' },
  { wilayaCode: '57', nameAr: 'عين صالح', nameFr: 'In Salah', name: 'عين صالح (In Salah)', lat: 27.1936, lng: 2.4608, type: 'wilaya', displayName: '[57] عين صالح - In Salah' },
  { wilayaCode: '58', nameAr: 'عين قزام', nameFr: 'In Guezzam', name: 'عين قزام (In Guezzam)', lat: 19.5667, lng: 5.7667, type: 'wilaya', displayName: '[58] عين قزام - In Guezzam' },

  // Famous Rivers & Flood Wadis (Oueds)
  { nameAr: 'وادي الحراش', nameFr: 'Oued El Harrach', name: 'وادي الحراش (Oued El Harrach)', lat: 36.7214, lng: 3.1367, type: 'oued', displayName: '🌊 وادي الحراش - الجزائر (Oued El Harrach)' },
  { nameAr: 'وادي بومرداس', nameFr: 'Oued Boumerdes', name: 'وادي بومرداس (Oued Boumerdès)', lat: 36.7621, lng: 3.4680, type: 'oued', displayName: '🌊 وادي بومرداس (Oued Boumerdès)' },
  { nameAr: 'وادي الشلف', nameFr: 'Oued Chélif', name: 'وادي الشلف (Oued Chélif)', lat: 36.1632, lng: 2.7185, type: 'oued', displayName: '🌊 وادي الشلف (Oued Chélif)' },
  { nameAr: 'وادي يسر', nameFr: 'Oued Isser', name: 'وادي يسر (Oued Isser - Boumerdès)', lat: 36.7194, lng: 3.6683, type: 'oued', displayName: '🌊 وادي يسر - بومرداس (Oued Isser)' },
  { nameAr: 'وادي سيبوس', nameFr: 'Oued Seybouse', name: 'وادي سيبوس (Oued Seybouse - Annaba/Guelma)', lat: 36.8722, lng: 7.7450, type: 'oued', displayName: '🌊 وادي سيبوس (عنابة / قالمة)' },
  { nameAr: 'وادي الرمال', nameFr: 'Oued Rhumel', name: 'وادي الرمال (Oued Rhumel - Constantine)', lat: 36.3680, lng: 6.6180, type: 'oued', displayName: '🌊 وادي الرمال - قسنطينة (Oued Rhumel)' },
  { nameAr: 'وادي الصومام', nameFr: 'Oued Soummam', name: 'وادي الصومام (Oued Soummam - Béjaïa)', lat: 36.7450, lng: 5.0650, type: 'oued', displayName: '🌊 وادي الصومام - بجاية (Oued Soummam)' },
  { nameAr: 'وادي سيباو', nameFr: 'Oued Sebaou', name: 'وادي سيباو (Oued Sebaou - Tizi Ouzou)', lat: 36.7280, lng: 4.0250, type: 'oued', displayName: '🌊 وادي سيباو - تيزي وزو' },
  { nameAr: 'وادي مافران', nameFr: 'Oued Mazafran', name: 'وادي مافران (Oued Mazafran - Tipaza/Alger)', lat: 36.6850, lng: 2.8050, type: 'oued', displayName: '🌊 وادي مافران (تيبازة / زرالدة)' },
  { nameAr: 'وادي مينا', nameFr: 'Oued Mina', name: 'وادي مينا (Oued Mina - Relizane)', lat: 35.7420, lng: 0.5510, type: 'oued', displayName: '🌊 وادي مينا - غليزان (Oued Mina)' },
  { nameAr: 'وادي تافنة', nameFr: 'Oued Tafna', name: 'وادي تافنة (Oued Tafna - Tlemcen)', lat: 35.2950, lng: -1.3350, type: 'oued', displayName: '🌊 وادي تافنة - تلمسان (Oued Tafna)' },

  // Key Communes & Daïras (Boumerdes, Alger, Blida, Tipaza, Oran, etc.)
  { nameAr: 'برج منايل', nameFr: 'Bordj Menaïel', name: 'برج منايل (Bordj Menaïel - بومرداس)', lat: 36.7431, lng: 3.7194, type: 'commune', displayName: 'برج منايل - بومرداس (Bordj Menaïel)' },
  { nameAr: 'دلس', nameFr: 'Dellys', name: 'دلس (Dellys - بومرداس)', lat: 36.9172, lng: 3.9131, type: 'commune', displayName: 'دلس - بومرداس (Dellys)' },
  { nameAr: 'خميس الخشنة', nameFr: 'Khemis El Khechna', name: 'خميس الخشنة (بومرداس)', lat: 36.6497, lng: 3.3308, type: 'commune', displayName: 'خميس الخشنة - بومرداس' },
  { nameAr: 'بودواو', nameFr: 'Boudouaou', name: 'بودواو (Boudouaou - بومرداس)', lat: 36.7289, lng: 3.4097, type: 'commune', displayName: 'بودواو - بومرداس (Boudouaou)' },
  { nameAr: 'الثنية', nameFr: 'Thénia', name: 'الثنية (Thénia - بومرداس)', lat: 36.7258, lng: 3.5567, type: 'commune', displayName: 'الثنية - بومرداس (Thénia)' },
  { nameAr: 'يسر', nameFr: 'Isser', name: 'يسر (Isser - بومرداس)', lat: 36.7194, lng: 3.6683, type: 'commune', displayName: 'يسر - بومرداس (Isser)' },
  { nameAr: 'زموري', nameFr: 'Zemmouri', name: 'زموري (Zemmouri - بومرداس)', lat: 36.7908, lng: 3.5686, type: 'commune', displayName: 'زموري - بومرداس (Zemmouri)' },
  { nameAr: 'قورصو', nameFr: 'Corso', name: 'قورصو (Corso - بومرداس)', lat: 36.7514, lng: 3.4358, type: 'commune', displayName: 'قورصو - بومرداس (Corso)' },
  { nameAr: 'سي مصطفى', nameFr: 'Si Mustapha', name: 'سي مصطفى (بومرداس)', lat: 36.7208, lng: 3.6158, type: 'commune', displayName: 'سي مصطفى - بومرداس' },
  { nameAr: 'الرويبة', nameFr: 'Rouïba', name: 'الرويبة (Rouïba - الجزائر)', lat: 36.7333, lng: 3.2833, type: 'commune', displayName: 'الرويبة - الجزائر (Rouïba)' },
  { nameAr: 'رغاية', nameFr: 'Reghaïa', name: 'رغاية (Reghaïa - الجزائر)', lat: 36.7364, lng: 3.3403, type: 'commune', displayName: 'رغاية - الجزائر (Reghaïa)' },
  { nameAr: 'باب الزوار', nameFr: 'Bab Ezzouar', name: 'باب الزوار (Bab Ezzouar - الجزائر)', lat: 36.7261, lng: 3.1829, type: 'commune', displayName: 'باب الزوار - الجزائر' },
  { nameAr: 'دار البيضاء', nameFr: 'Dar El Beïda', name: 'الدار البيضاء (الجزائر)', lat: 36.7133, lng: 3.2125, type: 'commune', displayName: 'الدار البيضاء - الجزائر' },
  { nameAr: 'زرالدة', nameFr: 'Zéralda', name: 'زرالدة (Zéralda - الجزائر)', lat: 36.7142, lng: 2.8425, type: 'commune', displayName: 'زرالدة - الجزائر (Zéralda)' },
  { nameAr: 'الشراقة', nameFr: 'Chéraga', name: 'الشراقة (Chéraga - الجزائر)', lat: 36.7667, lng: 2.9500, type: 'commune', displayName: 'الشراقة - الجزائر' },
  { nameAr: 'بوفاريك', nameFr: 'Boufarik', name: 'بوفاريك (Boufarik - البليدة)', lat: 36.5744, lng: 2.9125, type: 'commune', displayName: 'بوفاريك - البليدة (Boufarik)' },
  { nameAr: 'الأربعاء', nameFr: 'Larbaâ', name: 'الأربعاء (Larbaâ - البليدة)', lat: 36.5647, lng: 3.1542, type: 'commune', displayName: 'الأربعاء - البليدة (Larbaâ)' },
  { nameAr: 'مفتاح', nameFr: 'Meftah', name: 'مفتاح (Meftah - البليدة)', lat: 36.6203, lng: 3.2239, type: 'commune', displayName: 'مفتاح - البليدة (Meftah)' },
  { nameAr: 'القليعة', nameFr: 'Koléa', name: 'القليعة (Koléa - تيبازة)', lat: 36.6389, lng: 2.7689, type: 'commune', displayName: 'القليعة - تيبازة (Koléa)' },
  { nameAr: 'بوسماعيل', nameFr: 'Bou Ismaïl', name: 'بوسماعيل (Bou Ismaïl - تيبازة)', lat: 36.6428, lng: 2.6908, type: 'commune', displayName: 'بوسماعيل - تيبازة (Bou Ismaïl)' },
  { nameAr: 'شرشال', nameFr: 'Cherchell', name: 'شرشال (Cherchell - تيبازة)', lat: 36.6083, lng: 2.1931, type: 'commune', displayName: 'شرشال - تيبازة (Cherchell)' },
  { nameAr: 'خميس مليانة', nameFr: 'Khemis Miliana', name: 'خميس مليانة (عين الدفلى)', lat: 36.2611, lng: 2.2203, type: 'commune', displayName: 'خميس مليانة - عين الدفلى' },
  { nameAr: 'مليانة', nameFr: 'Miliana', name: 'مليانة (Miliana - عين الدفلى)', lat: 36.2972, lng: 2.2306, type: 'commune', displayName: 'مليانة - عين الدفلى (Miliana)' },
  { nameAr: 'العلمة', nameFr: 'El Eulma', name: 'العلمة (El Eulma - سطيف)', lat: 36.1528, lng: 5.6903, type: 'commune', displayName: 'العلمة - سطيف (El Eulma)' },
  { nameAr: 'الخروب', nameFr: 'El Khroub', name: 'الخروب (El Khroub - قسنطينة)', lat: 36.2631, lng: 6.6917, type: 'commune', displayName: 'الخروب - قسنطينة (El Khroub)' },
  { nameAr: 'أرزيو', nameFr: 'Arzew', name: 'أرزيو (Arzew - وهران)', lat: 35.8567, lng: -0.3150, type: 'commune', displayName: 'أرزيو - وهران (Arzew)' },
  { nameAr: 'عين الترك', nameFr: 'Aïn El Turk', name: 'عين الترك (وهران)', lat: 35.7425, lng: -0.7547, type: 'commune', displayName: 'عين الترك - وهران' },
  { nameAr: 'مغنية', nameFr: 'Maghnia', name: 'مغنية (Maghnia - تلمسان)', lat: 34.8483, lng: -1.7333, type: 'commune', displayName: 'مغنية - تلمسان (Maghnia)' },
  { nameAr: 'أقبو', nameFr: 'Akbou', name: 'أقبو (Akbou - بجاية)', lat: 36.4575, lng: 4.5350, type: 'commune', displayName: 'أقبو - بجاية (Akbou)' },
  { nameAr: 'الأخضرية', nameFr: 'Lakhdaria', name: 'الأخضرية (Lakhdaria - البويرة)', lat: 36.5647, lng: 3.5931, type: 'commune', displayName: 'الأخضرية - البويرة (Lakhdaria)' }
];

/**
 * Perform instant offline matching against our rich dictionary
 */
export function searchLocalDatabase(rawQuery: string): GeoLocationResult[] {
  const q = normalizeGeoText(rawQuery);
  if (!q || q.length < 1) return [];

  // Also test query without leading "ال" or "el" or "al"
  const qWithoutAl = q.startsWith('ال ') ? q.slice(3) : q.startsWith('ال') ? q.slice(2) : q;

  const matches = ALGERIAN_GEO_DATABASE.filter(item => {
    const nAr = normalizeGeoText(item.nameAr);
    const nFr = normalizeGeoText(item.nameFr);
    const nFull = normalizeGeoText(item.name);
    const nCode = item.wilayaCode || '';

    // Direct match
    if (nAr.includes(q) || nFr.includes(q) || nFull.includes(q)) return true;
    if (nCode === q) return true;

    // Match without "ال"
    if (qWithoutAl.length >= 2) {
      if (nAr.includes(qWithoutAl) || nFull.includes(qWithoutAl)) return true;
    }

    // Check words
    const words = q.split(' ');
    if (words.length > 1) {
      const allWordsInName = words.every(w => w.length < 2 || nAr.includes(w) || nFr.includes(w) || nFull.includes(w));
      if (allWordsInName) return true;
    }

    return false;
  });

  // Sort: exact matches first, then wilayas, then communes/oueds
  return matches.sort((a, b) => {
    const aAr = normalizeGeoText(a.nameAr);
    const aFr = normalizeGeoText(a.nameFr);
    const bAr = normalizeGeoText(b.nameAr);
    const bFr = normalizeGeoText(b.nameFr);

    const aExact = aAr === q || aFr === q || a.wilayaCode === q;
    const bExact = bAr === q || bFr === q || b.wilayaCode === q;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    if (a.type === 'wilaya' && b.type !== 'wilaya') return -1;
    if (a.type !== 'wilaya' && b.type === 'wilaya') return 1;

    return 0;
  });
}

/**
 * Multi-source geocoding with online fallback (Open-Meteo, Nominatim, Photon)
 */
export async function searchPlacesMultiTier(query: string): Promise<GeoLocationResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Tier 1: Instant local results (0ms latency, 100% reliable)
  const localResults = searchLocalDatabase(trimmed);

  // If local results have high-confidence exact match, return immediately or combine
  const onlineResults: GeoLocationResult[] = [];

  // Tier 2: Query Open-Meteo Geocoding (Open CORS, fast, covers Algerian communes in Arabic & French)
  try {
    const meteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=ar&format=json`;
    const res = await fetch(meteoUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        for (const r of data.results) {
          onlineResults.push({
            name: `${r.name}, ${r.country || ''}`,
            nameAr: r.name,
            nameFr: r.name,
            lat: parseFloat(r.latitude.toFixed(5)),
            lng: parseFloat(r.longitude.toFixed(5)),
            type: 'place',
            displayName: `📍 ${r.name}${r.admin1 ? ` (${r.admin1})` : ''} - ${r.country || ''}`
          });
        }
      }
    }
  } catch (e) {
    // Continue to next tier
  }

  // Tier 3: Query Nominatim OpenStreetMap (if onlineResults is still small)
  if (onlineResults.length < 2) {
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=5&accept-language=ar,fr`;
      const res = await fetch(osmUrl);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          for (const item of data) {
            onlineResults.push({
              name: item.display_name.split(',').slice(0, 2).join(', '),
              nameAr: item.name || item.display_name.split(',')[0],
              nameFr: item.name || item.display_name.split(',')[0],
              lat: parseFloat(parseFloat(item.lat).toFixed(5)),
              lng: parseFloat(parseFloat(item.lon).toFixed(5)),
              type: 'place',
              displayName: `📍 ${item.display_name.split(',').slice(0, 3).join(', ')}`
            });
          }
        }
      }
    } catch (e) {
      // Continue
    }
  }

  // Deduplicate combined results by lat/lng proximity
  const allResults = [...localResults, ...onlineResults];
  const seen = new Set<string>();
  const uniqueResults: GeoLocationResult[] = [];

  for (const item of allResults) {
    const key = `${item.lat.toFixed(2)},${item.lng.toFixed(2)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(item);
    }
  }

  return uniqueResults.slice(0, 10);
}
