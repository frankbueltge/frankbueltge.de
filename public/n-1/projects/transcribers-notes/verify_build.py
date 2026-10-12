"""Project 7, session 1: the verification decisions, made by reading every pair at edit distance 0 or above 2
in its note (JOURNAL item 10). Index k is the pair's position in pairs.json (registered run). Strike: not a
misprint and its correction. Repair: a true correction whose boundaries the pattern mangled, restated as the
note states it. Pairs at distance 1-2 are not edited (their error rate is estimated by a read sample)."""
import json
p = json.load(open("pairs.json"))
strike = [2,11,14,99,100,102,103,108,115,169,171,173,193,233,284,303,304,305,315,316,317,320,372,398,399,466,485,486,487,488,
          525,539,540,573,574,575,576,577,578,579,580,581,585,602,603,604,605,606,609,617,654,689,690,691,696,698,699,700,701,
          704,705,706,707,708,709,721,725,726,729,731,737,739,794,839,840,841,843,844,845,847,848,850,851,852,853,855,856,857,
          858,860,867,868,881,885,887,888,889,890,891,892,893,894,896,901,990,991,1030,1048,1057,1059,1079]
repair = {4:('Timaeo','Timæus'),179:('where-ever','wherever'),181:('silk makers','silk-makers'),183:('Uhlich','Ulrich'),
 343:('sufciently','sufficiently'),616:('Recalicitant','recalcitrant'),899:('Tchapitoulas','Tchoupitoulas'),900:('Tombigkbe','Tombigbee'),
 160:('Boblink','Bobolink'),155:('repective','respective'),306:('stanger','stranger'),307:('seen','see'),515:('need','heed'),
 516:('crystalized','crystallized'),517:('Havelock','Havelok'),518:('vension','venison'),519:('Whereever','Wherever'),520:('7','74'),
 521:('o','of'),522:('Alaf','Alef'),523:('Niger','Nigel'),524:('Herebald','Herebeald'),526:('332','232'),837:('superstitution','superstition'),
 838:('devolopment','development'),71:('an attempt will made to','an attempt will be made to'),72:('ejacuated Devereux','ejaculated Devereux'),
 73:('asked the American, cutely,','asked the American, acutely,'),74:('One warthy Berber','One swarthy Berber'),75:('she ay moored','she lay moored'),
 76:('are th signal that a','are the signal that a'),77:('the cluste of','the cluster of'),194:('would to tend','would be to tend'),
 195:('colleage,','colleague'),196:('thunberbolt','thunderbolt'),197:('one one','one'),198:('Borriboola-Gha','Borrioboola-Gha'),
 199:('responce','response'),200:('it it','it'),201:('a a','a'),202:('dus','dust'),203:('skil','skill'),204:('shiling','shilling'),
 205:('reremarkable','remarkable'),277:('Edmunds, During','Edmunds. During'),278:('use to','used to'),279:('Mahmúd','Máhmúd'),
 280:('A.B.','A.D.'),281:('Naishápur','Naishápúr'),283:('If','It'),285:("anothers's","another's"),286:('afoot','a-foot'),
 287:('was is','was it'),288:('Brighest','Brightest'),289:('name: of','name; of'),290:('sky. He','sky." He'),291:('heaven;','heaven'),
 292:('brest','breast'),322:('VI.,','VII.,'),325:('Italien en de','Italien ende'),326:('Salisbury','_Salisbury_'),
 327:('Sedley Rochester,','Sedley, Rochester,'),329:('Lousia','Louisa'),330:('Half Quarter','Half, Quarter'),333:('Lorton’s','LORTON’S'),
 334:('was’nt','wasn’t'),335:('N','N^{o}'),338:('inappropriately termed','inappropriately be termed'),402:('beau ideal','beau idéal'),
 403:('overrun','overran'),404:('salvage','savage'),405:('this forests abounds','this forest abounds'),407:('strength.','strength."'),
 408:('shelter.','shelter."'),409:('companions, the','companions, the dog'),461:('Chöl-yong-To','Chŏl-yong-To'),462:('Oieson','Oiesen'),
 463:('Pedlers','Pedlars'),464:('ehicle','vehicle'),465:('Yo Ju','Yö Ju'),314:('40:66','40-66'),318:('reparing','repairing'),
 107:('succeeded','succeed'),191:('Bucaneer','buccaneer'),192:('James','Jeames'),210:('THE GREAT RAID ON ZEEBRUGGE','A GREAT RAID'),
 211:('AND AFTER','AND THE FUTURE'),386:('hartstongue','hart’s-tongue'),872:('to so many','to so many eras')}
assert not set(strike) & set(repair)
out = [{"id": p[k]["id"], "from": p[k]["from"], "to": p[k]["to"], "action": "strike"} for k in strike]
out += [{"id": p[k]["id"], "from": p[k]["from"], "to": p[k]["to"], "action": "repair", "as": list(v)} for k, v in repair.items()]
json.dump(out, open("verify.json", "w"), indent=0, ensure_ascii=False)
hi = [k for k, x in enumerate(p) if x["lev"] > 2 or x["lev"] == 0]
assert set(strike) | set(repair) <= set(hi)
print(len(hi), "read;", len(strike), "struck;", len(repair), "repaired;", len(hi) - len(strike) - len(repair), "kept as is")
