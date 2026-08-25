/* Datos editables de la invitación. Lista actualizada desde “Regalos baby shower (1).xlsx”. */
const SITE = { birthDate:'2026-11-11T00:00:00-03:00', bank:{ bank:'Banco Estado', accountType:'Cuenta RUT', accountNumber:'15959892', holder:'Vanessa Sanchez', rut:'15.959.892-6', email:'' }, forms:{ rsvp:{url:'',entries:{}}, wish:{url:'',entries:{}}, reservation:{url:'',entries:{}} }, sheetCsv:'' };
const FALLBACK = { essential:'assets/gifts/generic-essential.svg', care:'assets/gifts/generic-care.svg', clothing:'assets/gifts/generic-textile.svg', feeding:'assets/gifts/generic-feeding.svg' };
const REAL_IMAGE_IDS = new Set([1,2,3,5,6,7,8,9,11,14,17,18,19,20,23,24,26,27,28,29,30,31,33,34,36,37]);
const gift=(id,name,price,link,category,brand='')=>({id,name,price,link,category,brand,image:REAL_IMAGE_IDS.has(id)?`assets/gifts/products/gift-${String(id).padStart(2,'0')}.jpg`:FALLBACK[category],estimated:true});
const GIFTS=[
 {id:'coche-aportado',name:'Coche de bebé Travel System',price:null,link:'https://bebesit.cl/products/coche-travel-system-fenix-azul',category:'essential',brand:'Bebesit',image:'assets/gifts/products/coche-aportado-natalia-eduardo.jpg',estimated:false,contributed:true,contributors:'Natalia y Eduardo'},
 gift(1,'Cuna colecho con mudador',79990,'https://www.falabella.com/falabella-cl/product/135858072/cuna-colecho-con-mudador-colchon-mosquitero-lubabycas-gris/135858073','essential'),
 gift(3,'Lima de uñas eléctrica',5990,'https://www.falabella.com/falabella-cl/product/154435776/kit-lima-corta-unas-electrico-bebes-6-en-1-silencioso-led-seguro-color-celeste/154435777','care'),
 gift(5,'Monitor bebé',44990,'https://www.falabella.com/falabella-cl/product/154972742/monitor-bebe-audio-y-video-x2-camara-vision-nocturna-bebesit/154972744','essential'),
 gift(6,'Saquito de dormir',20000,'https://www.falabella.com/falabella-cl/product/144556080/saquito-de-dormir-bebe-tog-1-5-pijama-saco-de-dormir/144556265','clothing'),
 gift(7,'Manta con tuto',12000,'https://www.falabella.com/falabella-cl/product/148486993/manta-con-tuto-bambula-de-nino/149835135','clothing'),
 gift(8,'Porteador ergonómico',27590,'https://www.falabella.com/falabella-cl/product/153740549/ergonomico-4-en-1-porta-bebe-transpirable-y-ajustable/153740550','essential'),
 gift(9,'Set de mamaderas anticólicos',27000,'https://www.falabella.com/falabella-cl/product/137323884/Set-mamadera-anti-colic-125-ML+260ML+330-ML-blue/137323885','feeding'),
 gift(10,'Calienta mamadera',19000,'https://www.falabella.com/falabella-cl/product/15726952/Calentador-Mamadera-8110-Bebesit/15726952','feeding'),
 gift(12,'Bolsas de leche materna (60)',12000,'https://www.falabella.com/falabella-cl/product/80141793/bolsas-leche-con-boquilla-y-sensor-de-temperatura-60-uds-momcozy/80141793','care'),
 gift(13,'Crema corporal ISDIN',20000,'https://www.mercadolibre.cl/locion-corporal-hidratante-isdin-baby-naturals-400ml/p/MLC20597758','care','ISDIN'),
 gift(14,'Sábanas de cuna colecho',25000,'https://www.falabella.com/falabella-cl/product/114480923/Juego-de-sabanas-broderie-cuna-colecho/114480924','clothing'),
 gift(15,'Ropa 3 a 6 meses (algodón pima)',14000,'https://www.falabella.com/falabella-cl/product/883455219/Pack-De-2-Bodys-Beb%C3%A9-Ni%C3%B1o-Algod%C3%B3n-Coniglio/883455220','clothing'),
 gift(16,'Jabón y shampoo sin perfume',19000,'https://www.falabella.com/falabella-cl/product/14896456/Gel-Shampoo-Baby-Naturals-400ml-ISDIN/14896456','care'),
 gift(17,'Crema contra rozaduras',10000,'https://www.falabella.com/falabella-cl/product/155372815/crema-mustela-para-rozaduras-1-2-3-100ml/155372816','care','Mustela'),
 gift(18,'Aceite de masajes',14000,'https://www.falabella.com/falabella-cl/product/127074217/Aceite-de-masajes-100ML-MUSTELA/127074218','care','Mustela'),
 gift(19,'Bandanas',8990,'https://www.falabella.com/falabella-cl/product/141256055/Pack-6-Bandanas-Bebe-Doble-Capa-De-Algodon-Y-Bordada/141256056','clothing'),
 gift(20,'Chupetes',9000,'https://www.falabella.com/falabella-cl/product/143952302/Chupete-Ultra-Air-Night-6-18m-Nino-Philips-Avent/143952303','care'),
 gift(21,'Set de bodys',22990,'https://bebesit.cl/products/pack-de-8-bodys-manga-larga-3-6m','clothing'),
 gift(22,'Tutos de muselina',10990,'https://bebesit.cl/products/pack-3-mantas-de-muselina-100-algodon-75-x-75-cm','clothing'),
 gift(23,'Silla para comer',27000,'https://www.falabella.com/falabella-cl/product/138679744/silla-de-comer-plegable-portatil-bebe-nino-fold-gris/138679745','feeding'),
 gift(24,'Set de alimentación',13000,'https://www.falabella.com/falabella-cl/product/132892933/Set-Alimentacion-Silicona-Libre-Bpa-9-Piezas-Antideslizante/132892934','feeding'),
 gift(26,'Detergente para bebé',10000,'https://www.falabella.com/falabella-cl/product/145836008/Detergente-bebe-3L-Hipoalergenico-aroma-manzanilla-Freemet-Ecologico-rinde-50-lavados/145836009','care'),
 gift(27,'Esterilizador para microondas',29000,'https://www.falabella.com/falabella-cl/product/152117582/esterilizador-de-microondas-blanco/152117584','feeding'),
 gift(28,'Recolector de leche manual',19000,'https://www.falabella.com/falabella-cl/product/113156472/recolector-de-leche/113156473','care'),
 gift(30,'Pack de dos mantas',12000,'https://www.falabella.com/falabella-cl/product/132868642/pack-2-mantas-bebe-hipoalergenica-110150-cm-celeste-bebesit/132868643','clothing'),
 gift(32,'Crema de lanolina',10000,'https://www.falabella.com/falabella-cl/product/80642549/Lanolina-Hpa-7-Grs-Lansinoh/80642549','care'),
 gift(33,'Absorbentes de lactancia',9000,'https://www.falabella.com/falabella-cl/product/141738544/pads-absorbentes-de-lactancia-ultra-delgados-60un-blanco/141738546','care'),
 gift(34,'Compresas frío/calor',9000,'https://www.falabella.com/falabella-cl/product/155926199/compresas-reutibilizable-calor-frio-lactancia-maternidad-mama/155926200','care'),
 gift(35,'Crema Cicaplast',14000,'https://www.falabella.com/falabella-cl/product/80673503/cicaplast-baume-b5-spf50-40ml/80673503','care'),
 gift(36,'Capa de baño',10000,'https://www.falabella.com/falabella-cl/product/148618763/Capa-de-bano-unisex/148618764','clothing')
];
const CONTRIBUTIONS=[{id:'c0',name:'Para pañales y toallitas húmedas',price:10000},{id:'c1',name:'Para sesión de fotos profesional',price:15000}];
const EXPERIENCES=[
 {title:'Una estrella para Luciano',price:10000,image:'assets/experiences/estrella-fugaz.webp',copy:'Una estrella fugaz para que nunca le falte un deseo por pedir.'},
 {title:'Clases de guitarra con Violeta Parra (no presenciales)',price:15000,image:'assets/experiences/guitarra.webp',copy:'“Gracias a la vida por habernos dado tanto”.'},
 {title:'Clases de fútbol con Alexis Sánchez',price:20000,image:'assets/experiences/alexis-sanchez.webp',copy:'“Me entendí”.'}
];
const SAMPLE_WISHES=[];
