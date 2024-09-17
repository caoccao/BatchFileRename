/*
 *   Copyright (c) 2024. caoccao.com Sam Cao
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

function Footer() {
  return (
    <Container sx={{ mt: "10px", textAlign: "center" }}>
      <Box component="footer">
        <Typography variant="body2" sx={{ margin: "0.5em" }}>
          <Link href="https://paypal.me/caoccao?locale.x=en_US" target="_blank">
            Donate to Support the Development
          </Link>
        </Typography>
        <Typography variant="body2" sx={{ margin: "0.5em" }}>
          © Copyright 2024
          <Link
            href="https://github.com/caoccao"
            target="_blank"
            sx={{ ml: "0.5em" }}
          >
            Sam Cao
          </Link>
          <Link
            href="https://www.caoccao.com/"
            target="_blank"
            sx={{ ml: "0.5em" }}
          >
            caoccao.com
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Footer;
