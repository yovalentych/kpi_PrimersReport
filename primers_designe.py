import math
import datetime


seq_f = input("Введіть свою Forward послідовність: ").upper()
seq_r = input("Введіть свою Reverse послідовність: ").upper()


# комплементарність


def getComplementSeq(seqForComplement):
    complementary = str()
    for char in seqForComplement:
        if char == "C":
            char = "G"
        elif char == "G":
            char = "C"
        elif char == "T":
            char = "A"
        elif char == "A":
            char = "T"
        complementary += char
    return complementary


# CG contain of primers (кількість)


def getCGcontent(seqForCGcounter):
    counter_of_CG = 0
    for char in seqForCGcounter:
        if char == "C" or char == "G":
            counter_of_CG += 1
    return counter_of_CG


# Tm of primers
def getPrimersTempMelt(nCG, seq):
    temp_melt = (nCG * 4) + ((len(seq) - nCG) * 2)
    return temp_melt


# delta Tm between Forward and Reverse
def getDeltaTempMelt(temp_melt_F, temp_melt_R):
    dTm = temp_melt_F - temp_melt_R
    return dTm


# Перевірка


# 5
def compareLenOfSeq(seqForCompareLen):
    if 18 <= len(seqForCompareLen) <= 22:
        return "праймер достатньої довжини"
    elif len(seqForCompareLen) <= 18:
        return "праймер малої довжини"
    elif len(seqForCompareLen) >= 22:
        return "праймер великої довжини"


# 6
def compareCGcontentOfSeq(cgContentseq, seqForCompareCGcontent):
    if math.floor(cgContentseq / len(seqForCompareCGcontent) * 100) == 50:
        return "вміст Ц/Г в праймері достатній"
    elif math.floor(cgContentseq / len(seqForCompareCGcontent) * 100) < 50:
        return "вміст Ц/Г в праймері недостатній"
    elif math.floor(cgContentseq / len(seqForCompareCGcontent) * 100) > 50:
        return "вміст Ц/Г в праймері завеликий"


# 7
def compareTempMeltSeq(tempMeltSeq):
    if 50 <= tempMeltSeq <= 60:
        return "температура плавлення праймерів прийнятна"
    elif tempMeltSeq <= 50:
        return "температура плавлення праймерів низька"
    elif tempMeltSeq >= 60:
        return "температура плавлення праймерів висока"


# 8
def compareDeltaTempMelt(deltaTempMelt):
    if abs(deltaTempMelt) <= 5:
        return "різниця в температурі плавлення прийнятна"
    elif abs(deltaTempMelt) > 5:
        return "різниця в температурі плавлення завелика"


# Функція для збереження результатів у текстовому файлі
def save_report(
    filename,
    authorName,
    forward_seq,
    reverse_seq,
    seqForwardComplement,
    seqReverseComplement,
    cgContentForward,
    cgContentReverse,
    tempMeltForward,
    tempMeltReverse,
    deltaTmelt,
    compareLenOfForward,
    compareLenOfReverse,
    compareCGcontentOfForward,
    compareCGcontentOfReverse,
    compareTempOfMeltOfForward,
    compareTempOfMeltOfReverse,
    compareDTM,
):
    with open(filename, "w", encoding="utf-8") as file:
        file.write(f"Дата та час збереження: {datetime.datetime.now()}\n")
        file.write(f"Виконав: {authorName}\n")
        file.write("------------------------------------------------------\n")
        file.write(
            f"Forward: 5`-{seqForwardComplement}-3`; Довжина: {len(seqForwardComplement)} | {compareLenOfForward}\n"
        )
        file.write(
            f"Reverse: 5`-{seqReverseComplement}-3`; Довжина: {len(seqReverseComplement)} | {compareLenOfReverse}\n"
        )
        file.write("------------------------------------------------------\n")
        file.write(
            f"F(GC) = {math.floor(cgContentForward/len(seqForwardComplement)*100)} % | {compareCGcontentOfForward}\n"
        )
        file.write(
            f"R(GC) = {math.floor(cgContentReverse/len(seqReverseComplement)*100)} % | {compareCGcontentOfReverse}\n"
        )
        file.write("------------------------------------------------------\n")
        file.write(f"F(Tm) = {tempMeltForward}\u00b0C | {compareTempOfMeltOfForward}\n")
        file.write(f"R(Tm) = {tempMeltReverse}\u00b0C | {compareTempOfMeltOfReverse}\n")
        file.write("------------------------------------------------------\n")
        file.write(f"d(Tm) = {abs(deltaTmelt)}\u00b0C | {compareDTM}\n")
        file.write("------------------------------------------------------\n")

    print(f"Звіт збережено у файлі: {filename}")


# **********************************************************

# 1
seqForwardComplement = getComplementSeq(seq_f)
seqReverseComplement = getComplementSeq(seq_r)
seqReverseComplement[::-1]

# 2
cgContentForward = getCGcontent(seqForwardComplement)
cgContentReverse = getCGcontent(seqReverseComplement)

# 3
tempMeltForward = getPrimersTempMelt(cgContentForward, seq_f)
tempMeltReverse = getPrimersTempMelt(cgContentReverse, seq_r)

# 4
deltaTmelt = getDeltaTempMelt(tempMeltForward, tempMeltReverse)

# 5
compareLenOfForward = compareLenOfSeq(seqForwardComplement)
compareLenOfReverse = compareLenOfSeq(seqReverseComplement)

# 6
compareCGcontentOfForward = compareCGcontentOfSeq(
    cgContentForward, seqForwardComplement
)
compareCGcontentOfReverse = compareCGcontentOfSeq(
    cgContentReverse, seqReverseComplement
)

# 7
compareTempOfMeltOfForward = compareTempMeltSeq(tempMeltForward)
compareTempOfMeltOfReverse = compareTempMeltSeq(tempMeltReverse)

# 8
compareDTM = compareDeltaTempMelt(deltaTmelt)


# Запитуємо користувача, чи він хоче зберегти результати у файл
save_to_file = input("Бажаєте зберегти результати у файл? (y/n): ").strip().lower()

if save_to_file == "y" or save_to_file == "yes":
    # Запитати ім'я автора
    authorName = input("Введіть ім'я виконавця: ")

    # Запитуємо назву файлу
    filename = input("Введіть назву файлу для збереження (з розширенням .txt): ")

    # Додаємо дату і час до назви файлу
    now = datetime.datetime.now()
    current_datetime = now.strftime("%d.%m.%Y_%H:%M")
    filename = filename

    # Зберігаємо результати у файл
    save_report(
        filename,
        authorName,
        seq_f,
        seq_r,
        seqForwardComplement,
        seqReverseComplement,
        cgContentForward,
        cgContentReverse,
        tempMeltForward,
        tempMeltReverse,
        deltaTmelt,
        compareLenOfForward,
        compareLenOfReverse,
        compareCGcontentOfForward,
        compareCGcontentOfReverse,
        compareTempOfMeltOfForward,
        compareTempOfMeltOfReverse,
        compareDTM,
    )
else:
    # Виводимо результати на екран
    print("------------------------------------------------------")
    print(
        f"Forward: {seqForwardComplement}; Довжина: {len(seqForwardComplement)} | {compareLenOfForward}"
    )
    print(
        f"Reverse: {seqReverseComplement}; Довжина: {len(seqReverseComplement)} | {compareLenOfReverse}"
    )
    print("------------------------------------------------------")
    print(
        f"F(GC) = {math.floor(cgContentForward/len(seqForwardComplement)*100)} % | {compareCGcontentOfForward}"
    )
    print(
        f"R(GC) = {math.floor(cgContentReverse/len(seqReverseComplement)*100)} % | {compareCGcontentOfReverse}"
    )
    print("------------------------------------------------------")
    print(f"F(Tm) = {tempMeltForward}\u00b0C | {compareTempOfMeltOfForward}")
    print(f"R(Tm) = {tempMeltReverse}\u00b0C | {compareTempOfMeltOfReverse}")
    print("------------------------------------------------------")
    print(f"d(Tm) = {abs(deltaTmelt)}\u00b0C | {compareDTM}")
    print("------------------------------------------------------")
