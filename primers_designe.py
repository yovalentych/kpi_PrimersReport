import argparse
import datetime
from dataclasses import dataclass
from pathlib import Path


VALID_BASES = {"A", "C", "G", "T"}
COMPLEMENT_TABLE = str.maketrans("ACGT", "TGCA")


@dataclass(frozen=True)
class PrimerAnalysis:
    name: str
    sequence: str
    complement: str
    reverse_complement: str
    gc_count: int
    gc_percent: float
    tm: int
    length_status: str
    gc_status: str
    tm_status: str


def normalize_sequence(sequence: str) -> str:
    return "".join(sequence.upper().split())


def validate_sequence(sequence: str) -> None:
    if not sequence:
        raise ValueError("послідовність не може бути порожньою")

    invalid_bases = sorted(set(sequence) - VALID_BASES)
    if invalid_bases:
        invalid = ", ".join(invalid_bases)
        raise ValueError(f"послідовність містить недопустимі символи: {invalid}")


def get_complement_seq(sequence: str) -> str:
    return sequence.translate(COMPLEMENT_TABLE)


def get_reverse_complement_seq(sequence: str) -> str:
    return get_complement_seq(sequence)[::-1]


def get_gc_count(sequence: str) -> int:
    return sum(base in {"C", "G"} for base in sequence)


def get_gc_percent(gc_count: int, sequence: str) -> float:
    return gc_count / len(sequence) * 100


def get_primer_tm(gc_count: int, sequence: str) -> int:
    at_count = len(sequence) - gc_count
    return gc_count * 4 + at_count * 2


def get_delta_tm(forward_tm: int, reverse_tm: int) -> int:
    return forward_tm - reverse_tm


def compare_len_of_seq(sequence: str) -> str:
    if 18 <= len(sequence) <= 22:
        return "праймер достатньої довжини"
    if len(sequence) < 18:
        return "праймер малої довжини"
    return "праймер великої довжини"


def compare_gc_content(gc_percent: float) -> str:
    if 40 <= gc_percent <= 60:
        return "вміст GC в праймері прийнятний"
    if gc_percent < 40:
        return "вміст GC в праймері недостатній"
    return "вміст GC в праймері завеликий"


def compare_tm(tm: int) -> str:
    if 50 <= tm <= 60:
        return "температура плавлення праймера прийнятна"
    if tm < 50:
        return "температура плавлення праймера низька"
    return "температура плавлення праймера висока"


def compare_delta_tm(delta_tm: int) -> str:
    if abs(delta_tm) <= 5:
        return "різниця температур плавлення прийнятна"
    return "різниця температур плавлення завелика"


def analyze_primer(name: str, sequence: str) -> PrimerAnalysis:
    normalized_sequence = normalize_sequence(sequence)
    validate_sequence(normalized_sequence)

    complement = get_complement_seq(normalized_sequence)
    reverse_complement = get_reverse_complement_seq(normalized_sequence)
    gc_count = get_gc_count(normalized_sequence)
    gc_percent = get_gc_percent(gc_count, normalized_sequence)
    tm = get_primer_tm(gc_count, normalized_sequence)

    return PrimerAnalysis(
        name=name,
        sequence=normalized_sequence,
        complement=complement,
        reverse_complement=reverse_complement,
        gc_count=gc_count,
        gc_percent=gc_percent,
        tm=tm,
        length_status=compare_len_of_seq(normalized_sequence),
        gc_status=compare_gc_content(gc_percent),
        tm_status=compare_tm(tm),
    )


def build_report(
    forward: PrimerAnalysis,
    reverse: PrimerAnalysis,
    author_name: str | None = None,
) -> str:
    delta_tm = get_delta_tm(forward.tm, reverse.tm)
    lines = [
        f"Дата та час формування: {datetime.datetime.now():%Y-%m-%d %H:%M:%S}",
    ]

    if author_name:
        lines.append(f"Виконав: {author_name}")

    lines.extend(
        [
            "------------------------------------------------------",
            format_primer_line(forward),
            format_primer_line(reverse),
            "------------------------------------------------------",
            format_gc_line(forward),
            format_gc_line(reverse),
            "------------------------------------------------------",
            format_tm_line(forward),
            format_tm_line(reverse),
            "------------------------------------------------------",
            f"d(Tm) = {abs(delta_tm)}°C | {compare_delta_tm(delta_tm)}",
            "------------------------------------------------------",
        ]
    )
    return "\n".join(lines)


def format_primer_line(analysis: PrimerAnalysis) -> str:
    return (
        f"{analysis.name}: 5'-{analysis.sequence}-3'; "
        f"комплементарна: 3'-{analysis.complement}-5'; "
        f"reverse complement: 5'-{analysis.reverse_complement}-3'; "
        f"довжина: {len(analysis.sequence)} | {analysis.length_status}"
    )


def format_gc_line(analysis: PrimerAnalysis) -> str:
    return (
        f"{analysis.name}(GC) = {analysis.gc_percent:.1f}% "
        f"({analysis.gc_count}/{len(analysis.sequence)}) | {analysis.gc_status}"
    )


def format_tm_line(analysis: PrimerAnalysis) -> str:
    return f"{analysis.name}(Tm) = {analysis.tm}°C | {analysis.tm_status}"


def save_report(filename: str, report: str) -> Path:
    report_path = Path(filename)
    report_path.write_text(report + "\n", encoding="utf-8")
    return report_path


def default_report_filename() -> str:
    return f"primer_report_{datetime.datetime.now():%Y%m%d_%H%M%S}.txt"


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Аналіз Forward/Reverse праймерів: GC, Tm, довжина та complement."
    )
    parser.add_argument("-f", "--forward", help="Forward послідовність праймера")
    parser.add_argument("-r", "--reverse", help="Reverse послідовність праймера")
    parser.add_argument("-a", "--author", help="Ім'я виконавця для звіту")
    parser.add_argument(
        "-o",
        "--output",
        help="Файл для збереження звіту. Якщо розширення не вказане, буде додано .txt",
    )
    parser.add_argument(
        "--save",
        action="store_true",
        help="Зберегти звіт у файл з автоматичною назвою, якщо --output не задано",
    )
    return parser


def normalize_output_filename(filename: str) -> str:
    if filename.endswith(".txt"):
        return filename
    return f"{filename}.txt"


def run_analysis(
    forward_sequence: str,
    reverse_sequence: str,
    author_name: str | None = None,
    output_filename: str | None = None,
    print_to_console: bool = True,
) -> str:
    forward = analyze_primer("Forward", forward_sequence)
    reverse = analyze_primer("Reverse", reverse_sequence)
    report = build_report(forward, reverse, author_name)
    if print_to_console:
        print(report)

    if output_filename:
        report_path = save_report(output_filename, report)
        print(f"Звіт збережено у файлі: {report_path}")

    return report


def read_primer(prompt: str) -> str:
    while True:
        sequence = normalize_sequence(input(prompt))
        try:
            validate_sequence(sequence)
        except ValueError as error:
            print(f"Помилка: {error}. Використовуйте лише A, C, G, T.")
        else:
            return sequence


def run_interactive() -> None:
    seq_forward = read_primer("Введіть Forward послідовність: ")
    seq_reverse = read_primer("Введіть Reverse послідовність: ")

    run_analysis(seq_forward, seq_reverse)

    save_to_file = input("Бажаєте зберегти результати у файл? (y/n): ").strip().lower()
    if save_to_file in {"y", "yes", "т", "так"}:
        author_name = input("Введіть ім'я виконавця: ").strip()
        filename = input("Введіть назву файлу для збереження (.txt): ").strip()

        if not filename:
            filename = default_report_filename()
        else:
            filename = normalize_output_filename(filename)

        run_analysis(
            seq_forward,
            seq_reverse,
            author_name or None,
            filename,
            print_to_console=False,
        )


def main() -> None:
    parser = build_argument_parser()
    args = parser.parse_args()

    if not args.forward and not args.reverse:
        run_interactive()
        return

    if not args.forward or not args.reverse:
        parser.error("аргументи --forward і --reverse потрібно передавати разом")

    output_filename = None
    if args.output:
        output_filename = normalize_output_filename(args.output)
    elif args.save:
        output_filename = default_report_filename()

    try:
        run_analysis(args.forward, args.reverse, args.author, output_filename)
    except ValueError as error:
        parser.error(str(error))


if __name__ == "__main__":
    main()
