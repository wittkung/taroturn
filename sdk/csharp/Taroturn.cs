using System;
using System.Runtime.InteropServices;
using System.Text;

namespace Taroturn
{
    public static class TarotEngine
    {
        private const string LibName = "taroturn_core";

        [DllImport(LibName, CallingConvention = CallingConvention.Cdecl)]
        private static extern IntPtr taroturn_version();

        [DllImport(LibName, CallingConvention = CallingConvention.Cdecl)]
        private static extern int taroturn_generate_seed(byte[] out_buf, UIntPtr buf_len);

        [DllImport(LibName, CallingConvention = CallingConvention.Cdecl)]
        private static extern int taroturn_draw_session_json(
            string spread_id,
            string question,
            string seed_hex,
            float reversal_rate,
            out IntPtr out_json
        );

        [DllImport(LibName, CallingConvention = CallingConvention.Cdecl)]
        private static extern int taroturn_get_card_json(byte card_id, out IntPtr out_json);

        [DllImport(LibName, CallingConvention = CallingConvention.Cdecl)]
        private static extern int taroturn_list_spreads_json(out IntPtr out_json);

        [DllImport(LibName, CallingConvention = CallingConvention.Cdecl)]
        private static extern void taroturn_free_string(IntPtr ptr);

        public static string Version()
        {
            IntPtr ptr = taroturn_version();
            return Marshal.PtrToStringAnsi(ptr);
        }

        public static string GenerateSeed()
        {
            byte[] buf = new byte[65];
            int rc = taroturn_generate_seed(buf, (UIntPtr)65);
            if (rc != 0) throw new InvalidOperationException($"GenerateSeed failed: {rc}");
            return Encoding.ASCII.GetString(buf).TrimEnd('\0');
        }

        public static string DrawSessionJson(string spreadId, string question = null, string seedHex = null, float reversalRate = 0.5f)
        {
            int rc = taroturn_draw_session_json(spreadId, question, seedHex, reversalRate, out IntPtr outJson);
            if (rc != 0 || outJson == IntPtr.Zero) throw new InvalidOperationException($"DrawSession failed: {rc}");
            string json = Marshal.PtrToStringUTF8(outJson);
            taroturn_free_string(outJson);
            return json;
        }
    }
}
