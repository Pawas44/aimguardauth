export function decryptClientString(encrypted: string, randomKey: string): string {
    const password = randomKey + "45783944810";
    let decrypted = "";
    for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i);
        // isgraph equivalent: 33 to 126
        if (charCode >= 33 && charCode <= 126) {
            const base = 32;
            const pCode = password.charCodeAt(i % password.length);
            
            let val = charCode - base - pCode;
            val = ((val % 95) + 95) % 95;
            
            decrypted += String.fromCharCode(val + base);
        } else {
            decrypted += encrypted[i];
        }
    }
    return decrypted;
}

export function generateServerEntryhash(token: string): string {
    const key = token + "uWymd";
    const ke = key.substring(0, 10);
    
    // URL encoded "socket": %73 %6F %63 %6B %65 %74
    // We replace '%' with '0' for the reverse UrlFixer
    let dnc_target = "07306F06306B065074";
    
    // If 'B' is in ke, use 'b' instead (UrlFixer converts %60 to %6B, but we are URL encoding explicitly)
    if (ke.includes('B')) {
        dnc_target = dnc_target.replace(/B/g, 'b');
    }
    
    let entryhash = "";
    for (let i = 0; i < dnc_target.length; i++) {
        const charCode = dnc_target.charCodeAt(i);
        if (charCode >= 48 && charCode <= 57) { // '0'-'9'
            entryhash += ke[charCode - 48];
        } else {
            entryhash += dnc_target[i];
        }
    }
    
    return entryhash;
}
