# TODO:
- [x] Mem addresser må ikke overlappe med hinanden (tag er det samme flere steder)
- [x] Størrelsen på addressererne er for store, prøv at lave dem mindre (256 perhaps)
- [x] Sørge for at sets er de rigtige antal ift til passer med pensum
- [x] Liens må IKKE have de samme tag og være valid 1 
- [x] Deep equal skal slettes og i stedet skal du tjekke om empty == 1

**ligenu så er lineIndex random, men er dette hvad vi ønsker? -Mahmood**
Ja, vi vil gerne have lineIndex er random for visual cache table, men
måske ikke for input cache table.

Når vi tjekker om det er et cache hit med input cache table, så skal vi også
huske at tjekke om der findes en eller anden der kunne være hit i det set.


# Feature notes:
-  Måske skal probabilityOfGetting a cache hit være configurable i settings. 


# Spørgmsål til Troels
- Hvis at vi har en cache, hvor en addresse ikke matcher på nogle af tagsene, så er det
 en cache miss. Men hvad hvis den matcher på, men selve addressen ikke ligger i den 
 memory range (Mem[x-x]), er det så stadig en cache miss?