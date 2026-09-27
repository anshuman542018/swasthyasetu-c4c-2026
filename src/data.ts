export type Facility = {id:string;name:string;district:string;state:string;lat:number;lon:number;stock:number;beds:number;occupied:number;staff:number;present:number;history:number[];updated:string};
export const medicine = 'ORS sachets';
export function seed(): Facility[] {
  const entries: [string,string,string,number,number,number,number,number,number,number,number][] = [
    ['Kendrapara PHC','Kendrapara','Odisha',20.50,86.42,135,24,19,12,9,43],
    ['Pattamundai PHC','Kendrapara','Odisha',20.58,86.57,95,18,14,9,7,32],
    ['Jagatsinghpur PHC','Jagatsinghpur','Odisha',20.25,86.17,1280,30,15,15,14,25],
    ['Cuttack Rural PHC','Cuttack','Odisha',20.46,85.88,920,32,21,16,14,28],
    ['Puri Community PHC','Puri','Odisha',19.82,85.83,165,26,22,13,10,38],
    ['Khordha PHC','Khordha','Odisha',20.18,85.62,1050,28,13,14,13,23],
    ['Srikakulam PHC','Srikakulam','Andhra Pradesh',18.30,83.90,170,24,18,12,9,35],
    ['Vizianagaram PHC','Vizianagaram','Andhra Pradesh',18.11,83.40,1160,30,18,15,13,24],
    ['Visakhapatnam Rural PHC','Visakhapatnam','Andhra Pradesh',17.82,83.18,900,28,17,14,13,26],
    ['Kolkata Periphery PHC','South 24 Parganas','West Bengal',22.43,88.40,220,32,24,16,12,36],
    ['Baruipur PHC','South 24 Parganas','West Bengal',22.35,88.44,1130,24,12,12,11,22],
    ['Howrah Rural PHC','Howrah','West Bengal',22.60,88.22,980,30,19,15,14,25]
  ];
  return entries.map((v,i)=>({id:`PHC-${String(i+1).padStart(3,'0')}`,name:v[0],district:v[1],state:v[2],lat:v[3],lon:v[4],stock:v[5],beds:v[6],occupied:v[7],staff:v[8],present:v[9],history:Array.from({length:28},(_,d)=>Math.max(1,Math.round(v[10]+d*.21+Math.sin(d*1.9+i)*4+(d%7===0?5:0)))),updated:new Date().toISOString()}));
}
