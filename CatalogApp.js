"use strict";
! function() {
    var a, b = angular.module("blueprintingCatalogWidget", []),
        c = "BLUEPRINTING CATALOG WIDGET",
        d = "unexpected error occurred",
        e = /blueprint.yaml$/i,
        f = {
            nfv: {
                order: 1,
                name: "Cloudify Labs",
                githubQuery: "user:cloudify-labs",
                canUpload: !0
            },
            blueprints: {
                order: 2,
                name: "blueprints",
                githubQuery: "-blueprint+in:name+fork:true+user:cloudify-examples",
                canUpload: !0
            }
        },
        g = "",
        h = "",
        i = "[CloudifyURL]",
        j = "";
    b.directive("blueprintingCatalog", ["Github", "CloudifyManager", "CatalogHelper", "$location", "$q", "$log", function(b, d, e, k, l, m) {
        return {
            restrict: "A",
            scope: {
                blueprintsGithubQuery: "@catalogBlueprintsGithubQuery",
                pluginsGithubQuery: "@catalogPluginsGithubQuery",
                integrationsGithubQuery: "@catalogIntegrationsGithubQuery",
                nfvGithubQuery: "@catalogNFVGithubQuery",
                listTitle: "@catalogListTitle",
                listDescription: "@catalogListDescription",
                howUseLink: "@catalogHowUseLink",
                howContributeLink: "@catalogHowContributeLink",
                backText: "@catalogBackText",
                catalogDefaultManager: "@catalogDefaultManager",
                catalogCorsProxy: "@catalogCorsProxy",
                defaultVersion: "@catalogDefaultVersion",
                defaultVersionFallback: "@catalogDefaultVersionFallback"
            },
            templateUrl: "blueprinting_catalog_widget_tpl.html",
            link: function(n) {
                a = n, n.blueprintsGithubQuery && (f.blueprints.githubQuery = n.blueprintsGithubQuery), n.pluginsGithubQuery && (f.plugins.githubQuery = n.pluginsGithubQuery), n.integrationsGithubQuery && (f.integrations.githubQuery = n.integrationsGithubQuery), n.nfvGithubQuery && (f.nfv.githubQuery = n.nfvGithubQuery), n.defaultVersion && (g = n.defaultVersion), n.defaultVersionFallback && (h = n.defaultVersionFallback), n.catalogDefaultManager && (i = n.catalogDefaultManager), n.catalogCorsProxy && (j = n.catalogCorsProxy), n.groups = f;
                var o = [];
                angular.forEach(f, function(a, d) {
                    a.loading = !0, o.push(b.getRepositories(a.githubQuery).then(function(b) {
                        m.debug(c, "fetched repos ", d, b);
                        for (var e = b.data && b.data.items || [], f = 0, g = e.length; g > f; f++) e[f].canUpload = !!a.canUpload;
                        a.repos = e
                    }, e.handleGithubLimit)["finally"](function() {
                        a.loading = !1
                    }))
                }), n.$watch(function() {
                    return k.search().repo
                }, function(a) {
                    a ? l.all(o).then(function() {
                        var b;
                        for (var c in f)
                            if (f.hasOwnProperty(c)) {
                                b = f[c].repos;
                                for (var d, e = 0, g = b.length; g > e; e++)
                                    if (d = b[e], d.id === +a) return void n.showDetails(d)
                            }
                    }) : n.showList()
                }), n.navigateToDetails = function(a) {
                    k.search("repo", a.id)
                }, n.navigateToList = function() {
                    k.replace(), k.search("repo", "")
                }, n.showDetails = function(a) {
                    l.when(e.fillVersions(a), function() {
                        a.currentVersion && e.fillReadme(a, a.currentVersion)
                    }), n.currentRepo = a
                }, n.switchVersion = function(a) {
                    e.changeVersion(n.currentRepo, a)
                }, n.showList = function() {
                    n.currentRepo = void 0
                }, n.showUpload = function(a) {
                    m.debug(c, "show upload", a), l.when(e.fillVersions(a), function() {
                        a.currentVersion && (n.blueprint.url = a.html_url + "/archive/" + a.currentVersion.name + ".zip", l.when(e.fillBlueprints(a, a.currentVersion), function() {
                            var b = a.blueprintFiles[a.currentVersion.name];
                            n.blueprint.path = b && b[0] || ""
                        }))
                    }), n.managerEndpoint = i, n.blueprint = {
                        id: a.name
                    }, n.uploadRepo = a
                }, n.selectNewVersion = function(a) {
                    var b = n.uploadRepo;
                    n.blueprint.url = b.html_url + "/archive/" + a.name + ".zip", l.when(e.changeVersion(b, a), function() {
                        n.blueprint && (n.blueprint.path = b.blueprintFiles[a.name][0])
                    })
                }, n.closeUpload = function() {
                    n.error = void 0, n.uploadRepo = void 0, n.blueprint = void 0
                }, n.uploadBlueprint = function() {
                    m.debug(c, "do upload"), n.blueprintForm.$valid && (n.processing = !0, n.error = void 0, d.upload(n.managerEndpoint, n.blueprint).then(function() {
                        n.closeUpload()
                    }, function(a) {
                        m.debug(c, "upload failed", a), n.error = e.getErrorFromResponse(a)
                    })["finally"](function() {
                        n.processing = !1
                    }))
                }
            }
        }
    }]), b.directive("reposList", [function() {
        return {
            restrict: "E",
            replace: !0,
            scope: {
                repos: "=",
                type: "=",
                loading: "=",
                canUpload: "=",
                showDetails: "&",
                showUpload: "&"
            },
            templateUrl: "repos_list_tpl.html"
        }
    }]), b.directive("copyToClipboard", ["$window", "$log", function(a, b) {
        return {
            restrict: "A",
            scope: {
                text: "="
            },
            link: function(d, e) {
                function f(d) {
                    var e = g(d);
                    i.body.appendChild(e);
                    try {
                        h(e), b.debug(c, "copied: " + d)
                    } catch (f) {
                        b.warn(c, "command not supported by your browser", f), b.warn(c, "using fallback impl."), a.prompt("Copy to clipboard & hit enter", d)
                    }
                    i.body.removeChild(e)
                }

                function g(a) {
                    var b = i.createElement("textarea");
                    return b.style.position = "absolute", b.style.left = "-5000px", b.textContent = a, b
                }

                function h(a) {
                    if (a.select(), !i.execCommand("copy")) throw "failed to  copy"
                }
                var i = a.document;
                e.on("click", function() {
                    f(d.text)
                })
            }
        }
    }]), b.filter("toArray", function() {
        return function(a) {
            var b = [];
            return angular.forEach(a, function(a) {
                b.push(a)
            }), b
        }
    }), b.factory("CatalogHelper", ["Github", "$q", "$sce", "$log", function(b, f, i, j) {
        return {
            changeVersion: function(a, b) {
                return j.debug(c, "change version to", b), a.currentVersion = b, f.all([this.fillReadme(a, b), this.fillBlueprints(a, b)])
            },
            fillVersions: function(a) {
                if (!a.versionsList) {
                    j.debug(c, "filling branches & tags for repo", a);
                    var d = [],
                        e = b.getTags(a.url),
                        i = b.getBranches(a.url);
                    return f.all([i, e]).then(function(b) {
                        d = d.concat(b[0].data || []).concat(b[1].data || []);
                        for (var c, e, f, i = g || h, j = a.default_branch, k = 0, l = d.length; l > k; k++) f = d[k], f.name === i && (c = f), f.name === j && (e = f);
                        a.currentVersion = c || e, a.versionsList = d
                    }, this.handleGithubLimit)
                }
            },
            fillBlueprints: function(a, d) {
                return a.blueprintFiles = a.blueprintFiles || {}, a.blueprintFiles[d.name] ? void 0 : (j.debug(c, "filling blueprints for repo", a), b.getTree(a.url, d.commit.sha).then(function(b) {
                    for (var c, f = [], g = b.data && b.data.tree || [], h = 0, i = g.length; i > h; h++) c = g[h], "blob" === c.type && e.test(c.path) && f.push(c.path);
                    a.blueprintFiles[d.name] = f
                }, this.handleGithubLimit))
            },
            fillReadme: function(a, d) {
                return a.readmeContents = a.readmeContents || {}, a.readmeContents[d.name] ? void 0 : (j.debug(c, "filling readme for repo", a), b.getReadme(a.url, d.name).then(function(b) {
                    a.readmeContents[d.name] = i.trustAsHtml(b.data || "No Readme File")
                }, this.handleGithubLimit))
            },
            handleGithubLimit: function(b) {
                403 === b.status && "0" === b.headers("X-RateLimit-Remaining") && (a.githubLimit = !0)
            },
            getErrorFromResponse: function(a) {
                return a && a.data ? "string" == typeof a.data ? a.data : a.data.message || d : d
            }
        }
    }]), b.factory("Github", ["$http", function(a) {
        var b = "https://api.github.com";
        return {
            getRepositories: function(c) {
                return a({
                    method: "GET",
                    url: b + "/search/repositories?q=" + c
                })
            },
            getTags: function(b) {
                return a({
                    method: "GET",
                    url: b + "/tags"
                })
            },
            getBranches: function(b) {
                return a({
                    method: "GET",
                    url: b + "/branches"
                })
            },
            getReadme: function(b, c) {
                return a({
                    method: "GET",
                    url: b + "/readme" + (c ? "?ref=" + encodeURIComponent(c) : ""),
                    headers: {
                        Accept: "application/vnd.github.html+json"
                    }
                })
            },
            getTree: function(b, c) {
                return a({
                    method: "GET",
                    url: b + "/git/trees/" + c
                })
            }
        }
    }]), b.factory("CloudifyManager", ["$http", function(a) {
        return {
            upload: function(b, c) {
                var d, e, f = [];
                return c.path && f.push("application_file_name=" + encodeURIComponent(c.path)), c.url && f.push("blueprint_archive_url=" + encodeURIComponent(c.url)), d = f.length ? "?" + f.join("&") : "", e = b + "/blueprints/" + encodeURIComponent(c.id) + d, a(j ? {
                    method: "POST",
                    url: j,
                    data: {
                        method: "PUT",
                        url: e
                    }
                } : {
                    method: "PUT",
                    url: e
                })
            }
        }
    }])
}(), angular.module("blueprintingCatalogWidget").run(["$templateCache", function(a) {
    a.put("blueprinting_catalog_widget_tpl.html", '<section class="bl-catalog"> <!--List of repositories--> <div ng-show="!currentRepo"> <div> <h1>{{::listTitle}}</h1> <p class="catalog-description"> {{::listDescription}} <a ng-href="{{howUseLink}}" target="_how_use" ng-if="howUseLink"><br>How to Use</a> <a ng-href="{{howContributeLink}}" target="_how_contribute" ng-if="howContributeLink"><br>How to Contribute</a> </p> </div> <div> <div class="alert alert-danger" ng-show="githubLimit"> GitHub API rate limit exceeded. Please wait some time and refresh the page. </div> <div ng-repeat="model in groups | toArray | orderBy:\'order\'"> <repos-list data-repos="model.repos" data-type="model.name" data-loading="model.loading" data-can-upload="!githubLimit && model.canUpload" data-show-details="navigateToDetails(repo)" data-show-upload="showUpload(repo)"> </repos-list> </div> </div> </div> <!--Repository\'s details--> <div ng-show="currentRepo"> <ng-include src="\'repo_details_tpl.html\'"></ng-include> </div> <!--Upload popup--> <div ng-show="uploadRepo && !githubLimit"> <ng-include src="\'upload_tpl.html\'"></ng-include> </div> </section>'), a.put("repo_details_tpl.html", '<div> <h1> <a href ng-click="navigateToList();" class="to-list">{{backText}}</a> {{currentRepo.name}} </h1> <ul class="action-links" ng-hide="githubLimit"> <li><a ng-href="{{currentRepo.html_url}}/tree/{{currentRepo.currentVersion.name}}" target="_tab_{{currentRepo.id}}">Source</a></li> <li><a ng-href="{{currentRepo.html_url}}/archive/{{currentRepo.currentVersion.name}}.zip">Download</a></li> <li ng-show="currentRepo.canUpload"><a href ng-click="showUpload(currentRepo);">Upload to Manager</a></li> </ul> <div class="versions-list" ng-hide="githubLimit"> <label> Branches & Tags: <select ng-model="currentRepo.currentVersion" ng-change="switchVersion(currentRepo.currentVersion);" ng-options="v as v.name for v in currentRepo.versionsList" required> </select> </label> </div> <hr> <div ng-bind-html="currentRepo.readmeContents[currentRepo.currentVersion.name]" ng-hide="githubLimit"></div> <div class="alert alert-danger" ng-show="githubLimit"> GitHub API rate limit exceeded. Please wait some time and refresh the page. </div> </div>'), a.put("repos_list_tpl.html", '<div class="repos-list"> <div class="search-repos"> <h4>{{type}}:</h4> <input type="text" ng-model="search.name" placeholder="search {{type}} by name"> </div> <div class="repos-row"> <div class="lab" ng-repeat="repo in filtered = (repos | filter:search)"> <h4>{{::repo.name}}</h4> <p>{{::repo.description}}</p> <div class="repo-actions"> <a ng-href="{{::repo.html_url}}" target="_tab_{{::repo.id}}">Source</a> <span ng-if="canUpload">| <a href ng-click="showUpload({repo: repo});">Upload to Manager</a></span> </div> </div> </div> <div ng-show="!loading && !filtered.length"> <td colspan="{{canUpload ? 4 : 3}}">No Data Found</td> </div> <div ng-show="loading"> <td colspan="{{canUpload ? 4 : 3}}">Loading...</td> </div> </div>'), a.put("upload_tpl.html", '<div class="modal-backdrop"></div> <div class="modal"> <div class="modal-dialog"> <div class="modal-content no-header"> <div class="modal-body"> <form novalidate name="$parent.blueprintForm"> <label> Blueprint ID<br> <input type="text" ng-model="blueprint.id" placeholder="enter blueprint name" required> </label> <label> Manager Endpoint URL<br> <input type="url" ng-model="$parent.managerEndpoint" placeholder="enter manager url" required> </label> <label> Blueprint File Name<br> <select ng-model="blueprint.path" ng-options="b for b in uploadRepo.blueprintFiles[uploadRepo.currentVersion.name]" required> </select> </label> <label class="archive-url"> Source<br> <select ng-model="uploadRepo.currentVersion" ng-change="selectNewVersion(uploadRepo.currentVersion);" ng-options="v as v.name for v in uploadRepo.versionsList" required> </select> <a href class="clipboard" copy-to-clipboard data-text="blueprint.url">Copy to Clipboard</a> </label> <div class="alert alert-danger" ng-show="error">{{error}}</div> </form> <div class="modal-buttons"> <button class="btn btn-default" ng-disabled="processing" ng-click="closeUpload();">Cancel</button> <button class="btn btn-primary" ng-disabled="processing || blueprintForm.$invalid" ng-click="uploadBlueprint();"> <span ng-show="processing">Uploading...</span> <span ng-hide="processing">Upload</span> </button> </div> </div> </div> </div> </div>')
}]);
