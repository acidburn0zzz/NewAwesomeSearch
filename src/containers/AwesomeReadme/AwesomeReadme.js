import React, { Component } from 'react';
import classes from './AwesomeReadme.module.css';
import TimeAgo from 'timeago-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faClock } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
class AwesomeReadme extends Component {
  state = {
    _html: `<br/><b># Waiting for content loading...</b>`,
    stars: 0,
    updateAt: null,
    user: '',
    repo: '',
  };

  shouldComponentUpdate() {
    return (
      this.state.user !== this.props.match.params.user &&
      this.state.repo !== this.props.match.params.repo
    );
  }

  componentDidMount() {
    axios
      .get(
        `https://api.github.com/repos/${this.props.match.params.user}/${this.props.match.params.repo}/readme`,
        {
          headers: {
            Accept: 'application/vnd.github.v3.html',
          },
        }
      )
      .then((res) => {
        const user = this.props.match.params.user;
        const repo = this.props.match.params.repo;
        let githubImageUrl = `https://raw.githubusercontent.com/${user}/${repo}/master`;
        let _html = res.data
          .replace(
            /<img [^>]*src=['"]([^'"]+)[^>]*>/gi,
            function (match, capture) {
              if (!capture.includes('https')) {
                githubImageUrl =
                  capture[0] === '/' ? githubImageUrl : githubImageUrl + '/';
                return match.replace(capture, `${githubImageUrl}${capture}`);
              } else {
                return match;
              }
            }
          )
          .replace(/user-content-/g, '');

        this.setState({
          _html: _html,
          user: user,
          repo: repo,
        });
      })
      .catch((err) => {
        this.setState({ _html: `Error when loading repo ${err.message}` });
      });

    // axios
    //   .get(
    //     `https://api.github.com/repos/${this.props.match.params.user}/${this.props.match.params.repo}/readme`,
    //     {
    //       headers: {
    //         Accept: 'application/vnd.github.v3.raw',
    //       },
    //     }
    //   )
    //   .then((res) => {
    //     this.props.setMdHandler(res.data);
    //   })
    //   .catch((err) => {
    //     this.setState({ _html: `Error when loading repo ${err.message}` });
    //   });

    axios
      .get(
        `https://api.github.com/repos/${this.props.match.params.user}/${this.props.match.params.repo}`
      )
      .then((res) => {
        this.setState({
          stars: res.data.stargazers_count,
          updateAt: res.data.pushed_at,
        });
      });
  }

  render() {
    return (
      <div className={classes.AwesomeReadme}>
        <div className={classes.ReadmeInfo}>
          <a
            href={`https://github.com/${this.props.match.params.user}/${this.props.match.params.repo}`}
          >
            View On Github
          </a>
          <div>
            <FontAwesomeIcon icon={faStar} /> stars:{this.state.stars}
          </div>
          <div>
            <FontAwesomeIcon icon={faClock} /> Last update at{' '}
            <TimeAgo datetime={this.state.updateAt} />
          </div>
        </div>

        <div dangerouslySetInnerHTML={{ __html: this.state._html }}></div>
      </div>
    );
  }
}

export default AwesomeReadme;
