import unittest

from primers_designe import (
    analyze_primer,
    compare_delta_tm,
    get_complement_seq,
    get_reverse_complement_seq,
    normalize_output_filename,
    normalize_sequence,
)


class PrimerAnalysisTest(unittest.TestCase):
    def test_normalize_sequence_removes_spaces_and_uppercases(self):
        self.assertEqual(normalize_sequence(" atgc ta\n"), "ATGCTA")

    def test_complement_and_reverse_complement(self):
        self.assertEqual(get_complement_seq("ATGC"), "TACG")
        self.assertEqual(get_reverse_complement_seq("ATGC"), "GCAT")

    def test_analyze_primer_calculates_metrics(self):
        analysis = analyze_primer("Forward", "ATGCGTACGTAGCTAGCTAA")

        self.assertEqual(analysis.sequence, "ATGCGTACGTAGCTAGCTAA")
        self.assertEqual(analysis.gc_count, 9)
        self.assertEqual(analysis.gc_percent, 45.0)
        self.assertEqual(analysis.tm, 58)
        self.assertEqual(analysis.length_status, "праймер достатньої довжини")
        self.assertEqual(analysis.gc_status, "вміст GC в праймері прийнятний")

    def test_rejects_invalid_symbols(self):
        with self.assertRaises(ValueError):
            analyze_primer("Forward", "ATGB")

    def test_delta_tm_status(self):
        self.assertEqual(compare_delta_tm(5), "різниця температур плавлення прийнятна")
        self.assertEqual(compare_delta_tm(6), "різниця температур плавлення завелика")

    def test_normalize_output_filename_adds_txt_extension(self):
        self.assertEqual(normalize_output_filename("report"), "report.txt")
        self.assertEqual(normalize_output_filename("report.txt"), "report.txt")


if __name__ == "__main__":
    unittest.main()
