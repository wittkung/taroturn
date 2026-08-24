// Package taroturn provides Go bindings for the Taroturn universal Tarot core engine.
package taroturn

/*
#cgo LDFLAGS: -L${SRCDIR}/../../target/release -L${SRCDIR}/../../target/debug -ltaroturn_core
#include "../../include/taroturn.h"
#include <stdlib.h>
*/
import "C"
import (
	"encoding/json"
	"fmt"
	"unsafe"
)

// Version returns the version string of the underlying Rust core engine.
func Version() string {
	return C.GoString(C.taroturn_version())
}

// GenerateSeed generates a random 64-character hexadecimal CSPRNG seed.
func GenerateSeed() (string, error) {
	buf := make([]byte, 65)
	cBuf := (*C.char)(unsafe.Pointer(&buf[0]))
	rc := C.taroturn_generate_seed(cBuf, 65)
	if rc != 0 {
		return "", fmt.Errorf("failed to generate seed: rc=%d", rc)
	}
	return C.GoString(cBuf), nil
}

// DrawSession draws a deterministic reading session and unmarshals into a map.
func DrawSession(spreadID string, question string, seedHex string, reversalRate float32) (map[string]interface{}, error) {
	cSpread := C.CString(spreadID)
	defer C.free(unsafe.Pointer(cSpread))

	var cQuestion *C.char
	if question != "" {
		cQuestion = C.CString(question)
		defer C.free(unsafe.Pointer(cQuestion))
	}

	var cSeed *C.char
	if seedHex != "" {
		cSeed = C.CString(seedHex)
		defer C.free(unsafe.Pointer(cSeed))
	}

	var cOutJSON *C.char
	rc := C.taroturn_draw_session_json(cSpread, cQuestion, cSeed, C.float(reversalRate), &cOutJSON)
	if rc != 0 || cOutJSON == nil {
		return nil, fmt.Errorf("draw session failed: rc=%d", rc)
	}
	defer C.taroturn_free_string(cOutJSON)

	jsonStr := C.GoString(cOutJSON)
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		return nil, err
	}
	return result, nil
}
