searchData={"items":[{"type":"behaviour","title":"tftp","doc":"Trivial FTP.\n\nInterface module for the `tftp` application.\n\n[](){: #options }","ref":"tftp.html"},{"type":"behaviour","title":"DATA TYPES - tftp","doc":"`ServiceConfig = Options`\n\n`Options = [option()]`\n\nMost of the options are common for both the client and the server side, but some\nof them differs a little. The available `option()`s are as follows:\n\n- **`{debug, Level}`** -\n  `Level = none | error | warning | brief | normal | verbose | all`\n\n  Controls the level of debug printouts. Default is `none`.\n\n- **`{host, Host}`** - `Host = hostname()`, see `m:inet`.\n\n  The name or IP address of the host where the TFTP daemon resides. This option\n  is only used by the client.\n\n- **`{port, Port}`** - `Port = int()`\n\n  The TFTP port where the daemon listens. Defaults is the standardized\n  number 69. On the server side, it can sometimes make sense to set it to 0,\n  meaning that the daemon just picks a free port (which one is returned by\n  function [`info/1`](`info/1`)).\n\n  If a socket is connected already, option `{udp, [{fd, integer()}]}` can be\n  used to pass the open file descriptor to `gen_udp`. This can be automated by\n  using a command-line argument stating the prebound file descriptor number. For\n  example, if the port is 69 and file descriptor 22 is opened by\n  `setuid_socket_wrap`, the command-line argument \"-tftpd_69 22\" triggers the\n  prebound file descriptor 22 to be used instead of opening port 69. The UDP\n  option `{udp, [{fd, 22}]}` is automatically added. See `init:get_argument/`\n  about command-line arguments and `gen_udp:open/2` about UDP options.\n\n- **`{port_policy, Policy}`** -\n  `Policy = random | Port | {range, MinPort, MaxPort}`\n\n  `Port = MinPort = MaxPort = int()`\n\n  Policy for the selection of the temporary port that is used by the\n  server/client during the file transfer. Default is `random`, which is the\n  standardized policy. With this policy a randomized free port is used. A single\n  port or a range of ports can be useful if the protocol passes through a\n  firewall.\n\n- **`{udp, Options}`** - `Options = [Opt]`, see\n  [gen_udp:open/2](`gen_udp:open/1`).\n\n- **`{use_tsize, Bool}`** - `Bool = bool()`\n\n  Flag for automated use of option `tsize`. With this set to `true`, the\n  [`write_file/3`](`write_file/3`) client determines the filesize and sends it\n  to the server as the standardized `tsize` option. A\n  [`read_file/3`](`read_file/3`) client acquires only a filesize from the server\n  by sending a zero `tsize`.\n\n- **`{max_tsize, MaxTsize}`** - `MaxTsize = int() | infinity`\n\n  Threshold for the maximal filesize in bytes. The transfer is aborted if the\n  limit is exceeded. Default is `infinity`.\n\n- **`{max_conn, MaxConn}`** - `MaxConn = int() | infinity`\n\n  Threshold for the maximal number of active connections. The daemon rejects the\n  setup of new connections if the limit is exceeded. Default is `infinity`.\n\n- **`{TftpKey, TftpVal}`** - `TftpKey = string()`  \n  `TftpVal = string()`\n\n  Name and value of a TFTP option.\n\n- **`{reject, Feature}`** - `Feature = Mode | TftpKey`  \n  ` Mode = read | write`  \n  ` TftpKey = string()`\n\n  Controls which features to reject. This is mostly useful for the server as it\n  can restrict the use of certain TFTP options or read/write access.\n\n- **`{callback, {RegExp, Module, State}}`** - `RegExp = string()`  \n  `Module = atom()`  \n  `State = term()`\n\n  Registration of a callback module. When a file is to be transferred, its local\n  filename is matched to the regular expressions of the registered callbacks.\n  The first matching callback is used during the transfer. See `read_file/3` and\n  `write_file/3`.\n\n  The callback module must implement the `tftp` behavior, see\n  [CALLBACK FUNCTIONS](`m:tftp#tftp_callback`).\n\n- **`{logger, Module}`** - `Module = module()`\n\n  Callback module for customized logging of errors, warnings, and info messages.\n  The callback module must implement the `m:tftp_logger` behavior. The default\n  module is `tftp_logger`.\n\n- **`{max_retries, MaxRetries}`** - `MaxRetries = int()`\n\n  Threshold for the maximal number of retries. By default the server/client\n  tries to resend a message up to five times when the time-out expires.\n\n[](){: #tftp_callback }","ref":"tftp.html#module-data-types"},{"type":"behaviour","title":"CALLBACK FUNCTIONS - tftp","doc":"A `tftp` callback module is to be implemented as a `tftp` behavior and export\nthe functions listed in the following.\n\nOn the server side, the callback interaction starts with a call to `open/5` with\nthe registered initial callback state. `open/5` is expected to open the\n(virtual) file. Then either function [`read/1`](`c:read/1`) or\n[`write/2`](`c:write/2`) is invoked repeatedly, once per transferred block. At\neach function call, the state returned from the previous call is obtained. When\nthe last block is encountered, function [`read/1`](`c:read/1`) or\n[`write/2`](`c:write/2`) is expected to close the (virtual) file and return its\nlast state. Function [`abort/3`](`c:abort/3`) is only used in error situations.\nFunction `prepare/5` is not used on the server side.\n\nOn the client side, the callback interaction is the same, but it starts and ends\na bit differently. It starts with a call to `prepare/5` with the same arguments\nas `open/5` takes. `prepare/5` is expected to validate the TFTP options\nsuggested by the user and to return the subset of them that it accepts. Then the\noptions are sent to the server, which performs the same TFTP option negotiation\nprocedure. The options that are accepted by the server are forwarded to function\n`open/5` on the client side. On the client side, function `open/5` must accept\nall option as-is or reject the transfer. Then the callback interaction follows\nthe same pattern as described for the server side. When the last block is\nencountered in [`read/1`](`c:read/1`) or [`write/2`](`c:write/2`), the returned\nstate is forwarded to the user and returned from `read_file`/3 or\n[`write_file/3`](`write_file/3`).\n\nIf a callback (performing the file access in the TFTP server) takes too long\ntime (more than the double TFTP time-out), the server aborts the connection and\nsends an error reply to the client. This implies that the server releases\nresources attached to the connection faster than before. The server simply\nassumes that the client has given up.\n\nIf the TFTP server receives yet another request from the same client (same host\nand port) while it already has an active connection to the client, it ignores\nthe new request if the request is equal to the first one (same filename and\noptions). This implies that the (new) client will be served by the already\nongoing connection on the server side. By not setting up yet another connection,\nin parallel with the ongoing one, the server consumes less resources.\n\n[](){: #prepare }","ref":"tftp.html#module-callback-functions"},{"type":"callback","title":"tftp.abort/3","doc":"Invoked when the file transfer is aborted.\n\nThe callback function is expected to clean up its used resources after the\naborted file transfer, such as closing open file descriptors and so on. The\nfunction is not invoked if any of the other callback functions returns an error,\nas it is expected that they already have cleaned up the necessary resources.\nHowever, it is invoked if the functions fail (crash).","ref":"tftp.html#c:abort/3"},{"type":"function","title":"tftp.change_config/2","doc":"change_config(Pid, Options) -> Result\n\nChanges configuration for all TFTP daemon processes.\n\nChanges configuration for all TFTP server processes.\n\nChanges configuration for a TFTP daemon, server, or client process.","ref":"tftp.html#change_config/2"},{"type":"function","title":"tftp.info/1","doc":"info(Pid) -> {ok, Options} | {error, Reason}\n\nReturns information about all TFTP daemon processes.\n\nReturns information about all TFTP server processes.\n\nReturns information about a TFTP daemon, server, or client process.","ref":"tftp.html#info/1"},{"type":"callback","title":"tftp.open/6","doc":"Opens a file for read or write access.\n\nOn the client side, where the `open/5` call has been preceded by a call to\n`prepare/5`, all options must be accepted or rejected.\n\nOn the server side, where there is no preceding `prepare/5` call, no new options\ncan be added, but those present in `SuggestedOptions` can be omitted or replaced\nwith new values in `AcceptedOptions`.\n\n[](){: #read }","ref":"tftp.html#c:open/6"},{"type":"callback","title":"tftp.prepare/6","doc":"Prepares to open a file on the client side.\n\nNo new options can be added, but those present in `SuggestedOptions` can be\nomitted or replaced with new values in `AcceptedOptions`.\n\nThis is followed by a call to `open/4` before any read/write access is\nperformed. `AcceptedOptions` is sent to the server, which replies with the\noptions that it accepts. These are then forwarded to `open/4` as\n`SuggestedOptions`.\n\n[](){: #open }","ref":"tftp.html#c:prepare/6"},{"type":"callback","title":"tftp.read/1","doc":"Reads a chunk from the file.\n\nThe callback function is expected to close the file when the last file chunk is\nencountered. When an error is encountered, the callback function is expected to\nclean up after the aborted file transfer, such as closing open file descriptors,\nand so on. In both cases there will be no more calls to any of the callback\nfunctions.\n\n[](){: #write }","ref":"tftp.html#c:read/1"},{"type":"function","title":"tftp.read_file/3","doc":"read_file(RemoteFilename, LocalFilename, Options) -> {ok, LastCallbackState} |\n{error, Reason}\n\nReads a (virtual) file `RemoteFilename` from a TFTP server.\n\nIf `LocalFilename` is the atom `binary`, `tftp_binary` is used as callback\nmodule. It concatenates all transferred blocks and returns them as one single\nbinary in `LastCallbackState`.\n\nIf `LocalFilename` is a string and there are no registered callback modules,\n`tftp_file` is used as callback module. It writes each transferred block to the\nfile named `LocalFilename` and returns the number of transferred bytes in\n`LastCallbackState`.\n\nIf `LocalFilename` is a string and there are registered callback modules,\n`LocalFilename` is tested against the regexps of these and the callback module\ncorresponding to the first match is used, or an error tuple is returned if no\nmatching regexp is found.","ref":"tftp.html#read_file/3"},{"type":"function","title":"tftp.start/1","doc":"start(Options) -> {ok, Pid} | {error, Reason}\n\nStarts a daemon process listening for UDP packets on a port. When it receives a\nrequest for read or write, it spawns a temporary server process handling the\nactual transfer of the (virtual) file.","ref":"tftp.html#start/1"},{"type":"callback","title":"tftp.write/2","doc":"Writes a chunk to the file.\n\nThe callback function is expected to close the file when the last file chunk is\nencountered. When an error is encountered, the callback function is expected to\nclean up after the aborted file transfer, such as closing open file descriptors,\nand so on. In both cases there will be no more calls to any of the callback\nfunctions.\n\n[](){: #abort }","ref":"tftp.html#c:write/2"},{"type":"function","title":"tftp.write_file/3","doc":"write_file(RemoteFilename, LocalFilename, Options) -> {ok, LastCallbackState} |\n{error, Reason}\n\nWrites a (virtual) file `RemoteFilename` to a TFTP server.\n\nIf `LocalFilename` is a binary, `tftp_binary` is used as callback module. The\nbinary is transferred block by block and the number of transferred bytes is\nreturned in `LastCallbackState`.\n\nIf `LocalFilename` is a string and there are no registered callback modules,\n`tftp_file` is used as callback module. It reads the file named `LocalFilename`\nblock by block and returns the number of transferred bytes in\n`LastCallbackState`.\n\nIf `LocalFilename` is a string and there are registered callback modules,\n`LocalFilename` is tested against the regexps of these and the callback module\ncorresponding to the first match is used, or an error tuple is returned if no\nmatching regexp is found.","ref":"tftp.html#write_file/3"},{"type":"type","title":"tftp.access/0","doc":"","ref":"tftp.html#t:access/0"},{"type":"type","title":"tftp.error_code/0","doc":"","ref":"tftp.html#t:error_code/0"},{"type":"type","title":"tftp.option/0","doc":"","ref":"tftp.html#t:option/0"},{"type":"type","title":"tftp.peer/0","doc":"","ref":"tftp.html#t:peer/0"},{"type":"behaviour","title":"tftp_logger","doc":"Trivial FTP logger.\n\nA `tftp_logger` callback module is to be implemented as a `tftp_logger` behavior\nand export the following functions:","ref":"tftp_logger.html"},{"type":"callback","title":"tftp_logger.error_msg/2","doc":"Logs an error message. See `error_logger:error_msg/2` for details.","ref":"tftp_logger.html#c:error_msg/2"},{"type":"callback","title":"tftp_logger.info_msg/2","doc":"Logs an info message. See `error_logger:info_msg/2` for details.","ref":"tftp_logger.html#c:info_msg/2"},{"type":"callback","title":"tftp_logger.warning_msg/2","doc":"Logs a warning message. See `error_logger:warning_msg/2` for details.","ref":"tftp_logger.html#c:warning_msg/2"},{"type":"extras","title":"TFTP Release Notes","doc":"<!--\n%CopyrightBegin%\n\nCopyright Ericsson AB 2023-2024. All Rights Reserved.\n\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n\n%CopyrightEnd%\n-->\n# TFTP Release Notes","ref":"notes.html"},{"type":"extras","title":"Tftp 1.2 - TFTP Release Notes","doc":"","ref":"notes.html#tftp-1-2"},{"type":"extras","title":"Improvements and New Features - TFTP Release Notes","doc":"- There is a new [`tftp_logger`](`m:tftp_logger`) callback behavior module.\n\n  Own Id: OTP-18787 Aux Id: [PR-7700]\n\n- The documentation has been migrated to use Markdown and ExDoc.\n\n  Own Id: OTP-18955 Aux Id: [PR-8026]\n\n[PR-7700]: https://github.com/erlang/otp/pull/7700\n[PR-8026]: https://github.com/erlang/otp/pull/8026","ref":"notes.html#improvements-and-new-features"},{"type":"extras","title":"Tftp 1.1.1 - TFTP Release Notes","doc":"","ref":"notes.html#tftp-1-1-1"},{"type":"extras","title":"Fixed Bugs and Malfunctions - TFTP Release Notes","doc":"- Replaced unintentional Erlang Public License 1.1 headers in some files with\n  the intended Apache License 2.0 header.\n\n  Own Id: OTP-18815 Aux Id: PR-7780","ref":"notes.html#fixed-bugs-and-malfunctions"},{"type":"extras","title":"Tftp 1.1 - TFTP Release Notes","doc":"","ref":"notes.html#tftp-1-1"},{"type":"extras","title":"Improvements and New Features - TFTP Release Notes","doc":"- The implementation has been fixed to use `proc_lib:init_fail/2,3` where\n  appropriate, instead of `proc_lib:init_ack/1,2`.\n\n  \\*** POTENTIAL INCOMPATIBILITY \\***\n\n  Own Id: OTP-18490 Aux Id: OTP-18471, GH-6339, PR-6843","ref":"notes.html#improvements-and-new-features"},{"type":"extras","title":"Tftp 1.0.4 - TFTP Release Notes","doc":"","ref":"notes.html#tftp-1-0-4"},{"type":"extras","title":"Improvements and New Features - TFTP Release Notes","doc":"- Replace size/1 with either tuple_size/1 or byte_size/1\n\n  The [`size/1`](`size/1`) BIF is not optimized by the JIT, and its use can\n  result in worse types for Dialyzer.\n\n  When one knows that the value being tested must be a tuple,\n  [`tuple_size/1`](`tuple_size/1`) should always be preferred.\n\n  When one knows that the value being tested must be a binary,\n  [`byte_size/1`](`byte_size/1`) should be preferred. However,\n  [`byte_size/1`](`byte_size/1`) also accepts a bitstring (rounding up size to a\n  whole number of bytes), so one must make sure that the call to `byte_size/` is\n  preceded by a call to [`is_binary/1`](`is_binary/1`) to ensure that bitstrings\n  are rejected. Note that the compiler removes redundant calls to\n  [`is_binary/1`](`is_binary/1`), so if one is not sure whether previous code\n  had made sure that the argument is a binary, it does not harm to add an\n  [`is_binary/1`](`is_binary/1`) test immediately before the call to\n  [`byte_size/1`](`byte_size/1`).\n\n  Own Id: OTP-18432 Aux Id:\n  GH-6672,PR-6793,PR-6784,PR-6787,PR-6785,PR-6682,PR-6800,PR-6797,PR-6798,PR-6799,PR-6796,PR-6813,PR-6671,PR-6673,PR-6684,PR-6694,GH-6677,PR-6696,PR-6670,PR-6674","ref":"notes.html#improvements-and-new-features"},{"type":"extras","title":"Tftp 1.0.3 - TFTP Release Notes","doc":"","ref":"notes.html#tftp-1-0-3"},{"type":"extras","title":"Fixed Bugs and Malfunctions - TFTP Release Notes","doc":"- Missing runtime dependencies has been added to this application.\n\n  Own Id: OTP-17243 Aux Id: PR-4557","ref":"notes.html#fixed-bugs-and-malfunctions"},{"type":"extras","title":"Tftp 1.0.2 - TFTP Release Notes","doc":"","ref":"notes.html#tftp-1-0-2"},{"type":"extras","title":"Improvements and New Features - TFTP Release Notes","doc":"- Removed compiler warnings.\n\n  Own Id: OTP-16317 Aux Id: OTP-16183","ref":"notes.html#improvements-and-new-features"},{"type":"extras","title":"Tftp 1.0.1 - TFTP Release Notes","doc":"","ref":"notes.html#tftp-1-0-1"},{"type":"extras","title":"Fixed Bugs and Malfunctions - TFTP Release Notes","doc":"- Improved documentation.\n\n  Own Id: OTP-15190","ref":"notes.html#fixed-bugs-and-malfunctions"},{"type":"extras","title":"TFTP 1.0 - TFTP Release Notes","doc":"","ref":"notes.html#tftp-1-0"},{"type":"extras","title":"First released version - TFTP Release Notes","doc":"- Inets application was split into multiple smaller protocol specific\n  applications. The TFTP application is a standalone TFTP client and server with\n  the same functionality as TFTP in Inets.\n\n  Own Id: OTP-14113","ref":"notes.html#first-released-version"},{"type":"extras","title":"Introduction","doc":"<!--\n%CopyrightBegin%\n\nCopyright Ericsson AB 2023-2024. All Rights Reserved.\n\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n\n%CopyrightEnd%\n-->\n# Introduction","ref":"introduction.html"},{"type":"extras","title":"Purpose - Introduction","doc":"The Trivial File Transfer Protocol or TFTP is a very simple protocol used to\ntransfer files.\n\nIt has been implemented on top of the User Datagram protocol (UDP) so it may be\nused to move files between machines on different networks implementing UDP. It\nis designed to be small and easy to implement. Therefore, it lacks most of the\nfeatures of a regular FTP. The only thing it can do is read and write files (or\nmail) from/to a remote server. It cannot list directories, and currently has no\nprovisions for user authentication.\n\nThe `tftp` application implements the following IETF standards:\n\n- RFC 1350, The TFTP Protocol (revision 2)\n- RFC 2347, TFTP Option Extension\n- RFC 2348, TFTP Blocksize Option\n- RFC 2349, TFTP Timeout Interval and Transfer Size Options\n\nThe only feature that not is implemented is the `netascii` transfer mode.","ref":"introduction.html#purpose"},{"type":"extras","title":"Prerequisites - Introduction","doc":"It is assumed that the reader is familiar with the Erlang programming language,\nconcepts of OTP, and has a basic understanding of the TFTP protocol.","ref":"introduction.html#prerequisites"},{"type":"extras","title":"Getting Started","doc":"<!--\n%CopyrightBegin%\n\nCopyright Ericsson AB 2023-2024. All Rights Reserved.\n\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n\n%CopyrightEnd%\n-->\n# Getting Started","ref":"getting_started.html"},{"type":"extras","title":"General Information - Getting Started","doc":"The [start/1](`tftp:start/1`) function starts a daemon process listening for UDP\npackets on a port. When it receives a request for read or write, it spawns a\ntemporary server process handling the transfer.\n\nOn the client side, function [read_file/3](`tftp:read_file/3`) and\n[write_file/3](`tftp:write_file/3`) spawn a temporary client process\nestablishing contact with a TFTP daemon and perform the file transfer.\n\n`tftp` uses a callback module to handle the file transfer. Two such callback\nmodules are provided, `tftp_binary` and `tftp_file`. See\n[read_file/3](`tftp:read_file/3`) and [write_file/3](`tftp:write_file/3`) for\ndetails. You can also implement your own callback modules, see\n[CALLBACK FUNCTIONS](`m:tftp#tftp_callback`). A callback module provided by the\nuser is registered using option `callback`, see [DATA TYPES](`m:tftp#options`).","ref":"getting_started.html#general-information"},{"type":"extras","title":"Using the TFTP client and server - Getting Started","doc":"This is a simple example of starting the TFTP server and reading the content of\na sample file using the TFTP client.\n\n_Step 1._ Create a sample file to be used for the transfer:\n\n```text\n      $ echo \"Erlang/OTP 21\" > file.txt\n```\n\n_Step 2._ Start the TFTP server:\n\n```erlang\n      1> {ok, Pid} = tftp:start([{port, 19999}]).\n      {ok,<0.65.0>}\n```\n\n_Step 3._ Start the TFTP client (in another shell):\n\n```erlang\n      1> tftp:read_file(\"file.txt\", binary, [{port, 19999}]).\n      {ok,<<\"Erlang/OTP 21\\n\">>}\n```","ref":"getting_started.html#using-the-tftp-client-and-server"}],"content_type":"text/plain","producer":{"name":"ex_doc","version":[48,46,51,52,46,49]}}