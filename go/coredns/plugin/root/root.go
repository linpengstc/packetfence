package root

import (
	"log"
	"os"

	"github.com/inverse-inc/packetfence/go/coredns/core/dnsserver"
	"github.com/inverse-inc/packetfence/go/coredns/plugin"

	"github.com/inverse-inc/packetfence/go/caddy/caddy"
)

func init() {
	caddy.RegisterPlugin("root", caddy.Plugin{
		ServerType: "dns",
		Action:     setup,
	})
}

func setup(c *caddy.Controller) error {
	config := dnsserver.GetConfig(c)

	for c.Next() {
		if !c.NextArg() {
			return plugin.Error("root", c.ArgErr())
		}
		config.Root = c.Val()
	}

	// Check if root path exists
	_, err := os.Stat(config.Root)
	if err != nil {
		if os.IsNotExist(err) {
			// Allow this, because the folder might appear later.
			// But make sure the user knows!
			log.Printf("[WARNING] Root path does not exist: %s", config.Root)
		} else {
			return plugin.Error("root", c.Errf("unable to access root path '%s': %v", config.Root, err))
		}
	}

	return nil
}
